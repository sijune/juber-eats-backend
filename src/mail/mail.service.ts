import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable() //설정되어 있어야 한다.
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: MailModuleOptions,
  ) {}
  //   curl -s --user 'api:YOUR_API_KEY' \
  //   https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
  //   -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
  //   -F to=YOU@YOUR_DOMAIN_NAME \
  //   -F to=bar@example.com \
  //   -F subject='Hello' \
  //   -F text='Testing some Mailgun awesomeness!'

  //   -F : Form
  async sendEmail(subject: string, template: string, emailVars: EmailVar[]): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Sijune from Juber Eats <mailgun@${this.options.domain}>`);
    form.append('to', `sijune0525@gmail.com`);
    form.append('subject', subject);
    form.append('template', template); //template 사용
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      const response = await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`, //인증방식 룰(헤더)
        },
        body: form,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
