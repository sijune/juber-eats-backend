export interface MailModuleOptions {
  apiKey: string;
  domain: string; //메일 송신처
  fromEmail: string;
}

export interface EmailVar {
  key: string;
  value: string;
}
