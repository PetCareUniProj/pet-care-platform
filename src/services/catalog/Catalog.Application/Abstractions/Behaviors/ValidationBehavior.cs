using FluentValidation;

namespace Catalog.Application.Abstractions.Behaviors;

internal sealed class ValidationBehavior<TMessage, TResponse> : IPipelineBehavior<TMessage, TResponse>
    where TMessage : IMessage
    where TResponse : class
{
    private readonly IEnumerable<IValidator<TMessage>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TMessage>> validators)
    {
        _validators = validators;
    }

    public async ValueTask<TResponse> Handle(TMessage message, MessageHandlerDelegate<TMessage, TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next(message, cancellationToken);
        }

        var context = new ValidationContext<TMessage>(message);

        var validationResults = await Task.WhenAll(
            _validators.Select(validator => validator.ValidateAsync(context, cancellationToken)));

        var validationFailures = validationResults
            .Where(validationResult => !validationResult.IsValid)
            .SelectMany(validationResult => validationResult.Errors)
            .ToArray();

        if (validationFailures.Length == 0)
        {
            return await next(message, cancellationToken);
        }

        var errors = validationFailures
            .Select(failure => Error.Problem(failure.ErrorCode, failure.ErrorMessage))
            .ToArray();

        var validationError = new ValidationError(errors);

        // Check if TResponse is Result<T> or Result
        var responseType = typeof(TResponse);

        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            // For Result<T>
            var valueType = responseType.GetGenericArguments()[0];
            var failureResult = CreateGenericResultFailure(valueType, validationError);
            return (TResponse)failureResult;
        }

        if (responseType == typeof(Result))
        {
            // For non-generic Result
            return (TResponse)(object)Result.Failure(validationError);
        }

        // If we get here, TResponse is not a Result type
        throw new ValidationException("Validation failed", validationFailures);
    }

    // Helper method to create a generic Result<T> failure
    private static object CreateGenericResultFailure(Type valueType, ValidationError validationError)
    {
        // Use the generic Result.Failure<T> method with specific type parameter
        var method = typeof(Result).GetMethods()
            .First(m =>
                m.Name == nameof(Result.Failure) &&
                m.IsGenericMethod &&
                m.GetParameters().Length == 1 &&
                m.GetParameters()[0].ParameterType == typeof(Error));

        var genericMethod = method.MakeGenericMethod(valueType);
        return genericMethod.Invoke(null, new object[] { validationError })!;
    }
}

