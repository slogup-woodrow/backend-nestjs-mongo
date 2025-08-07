import { commonConstants } from 'src/shared/constants/common.constants';
import * as path from 'path';

const { LOCAL, DEV, PROD, TEST } = commonConstants.props.nodeEnvs;
let envFilePath = 'envs/.env.local';
if (process.env.NODE_ENV === TEST) envFilePath = 'envs/.env.test';
if (process.env.NODE_ENV === DEV) envFilePath = 'envs/.env.dev';
if (process.env.NODE_ENV === PROD) envFilePath = 'envs/.env.prod';

export default envFilePath;
