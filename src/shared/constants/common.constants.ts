const nodeEnvs = {
  LOCAL: 'local',
  DEV: 'dev',
  PROD: 'prod',
  TEST: 'test',
} as const;

const NODE_ENV_ARRAY: string[] = Object.values(nodeEnvs);

const languages = {
  KO: 'ko',
  EN: 'en',
} as const;

const LANGUAGE_ARRAY = Object.values(languages);

export const commonConstants = {
  props: { nodeEnvs, NODE_ENV_ARRAY, languages },
  errorMessages: {
    COMMON_ERROR_MESSAGE_BEARER_TOKEN_NEEDED: {
      errorCode: 'COMMON_ERROR_MESSAGE_BEARER_TOKEN_NEEDED',
      en: 'This API request requires a bearer token.',
      ko: '해당 API 요청은 Bearer 토큰을 필요로 합니다.',
    },
  },
  // defaultQuery: {},
  injectionToken: {},
};
