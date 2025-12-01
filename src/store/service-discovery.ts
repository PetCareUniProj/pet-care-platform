type EndpointPreference = {
  service: string;
  preferred_http?: boolean;
};

const endpointPreferences: EndpointPreference[] = [
  { service: "basket-api", preferred_http: true },
];

export function getServiceEndpoint(serviceName: string) {
  const normalizedName = serviceName.toUpperCase();
  const httpsKey = `${normalizedName}_HTTPS`;
  const httpKey = `${normalizedName}_HTTP`;
  const preference = endpointPreferences.find(
    (entry) => entry.service.toUpperCase() === normalizedName,
  );
  const preferHttp = Boolean(preference?.preferred_http);

  const candidates = preferHttp
    ? [process.env[httpKey], process.env[httpsKey]]
    : [process.env[httpsKey], process.env[httpKey]];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return undefined;
}

export function getKeycloakIssuer(serviceName: string, realm: string) {
  return `${getServiceEndpoint(serviceName)}/realms/${realm}`;
}