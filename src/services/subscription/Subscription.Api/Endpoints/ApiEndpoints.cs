namespace Subscription.Api.Endpoints;

public static class ApiEndpoints
{
    private const string ApiBase = "api/Subscriptions";

    public static class Subscriptions
    {
        private const string Base = $"{ApiBase}";
        public const string CreateDraft = $"{Base}/draft";
        public const string Create = $"{Base}";
        public const string Cancel = $"{Base}/cancel/{{id:int}}";
        public const string Ship = $"{Base}/ship/{{id:int}}";
        public const string GetCardTypes = $"{Base}/cardtypes";
        public const string GetById = $"{Base}/{{id:int}}";
        public const string GetByUser = $"{Base}/user/me";
        public const string GetByUserId = $"{Base}/user/{{userId:guid}}";
    }
}


