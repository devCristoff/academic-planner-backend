import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';

@Injectable()
export class TemplateService {
  private templatePath = join(__dirname, '../../common/templates/presentation.template.md');

  private toSentenceCase(text: string): string {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  renderPresentationTemplate(user: DtUser, title: string, dueDate?: Date): string {
    const template = readFileSync(this.templatePath, 'utf-8');
    const formattedName = this.toSentenceCase(user.name);
    const formattedLastName = this.toSentenceCase(user.lastName);
    const completeName = `${formattedName} ${formattedLastName}`.trim();
    const date = dueDate ? dueDate.toLocaleDateString('es-DO') : new Date().toLocaleDateString('es-DO');

    return template
      .replace('[TITLE]', title)
      .replace('[COMPLETE_NAME]', completeName)
      .replace('[TUITION_ID]', user.tuitionId)
      .replace('[DATE]', date);
  }
}
