import Axios from 'axios';
import ora from 'ora';

export interface TemplateConfig {
  templates: {
    name: string;
    branch: string;
  }[];
}

export const templates = async (): Promise<TemplateConfig> => {
  const response = await Axios.get(
    `https://api.github.com/repos/minetsh/template/contents/template.json?ref=master`,
  );
  const { status, data } = response;
  if (status === 200) {
    const { content } = data;
    const buf = Buffer.from(content, 'base64');
    return JSON.parse(buf.toString());
  } else {
    throw response.statusText;
  }
};

export default async function (): Promise<void> {
  const o = ora(`获取列表`).start();
  try {
    const response = await Axios.get(
      `https://api.github.com/repos/minetsh/template/contents/template.json?ref=master`,
    );
    const { status, data } = response;
    if (status === 200) {
      o.succeed();
      const { content } = data;
      const buf = Buffer.from(content, 'base64');
      const template: TemplateConfig = JSON.parse(buf.toString());
      (template.templates || []).forEach((t, index: number) => {
        console.log(`${index + 1}. ${t.name}`);
      });
    } else {
      o.fail(`${response.status}: ${response.statusText}`);
    }
  } catch (e) {
    o.fail(`${e}`);
  }
}