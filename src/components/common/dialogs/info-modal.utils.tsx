'use client';
import type { Answers } from '@/lib/core/types';
import { getEducationLabel } from '@/lib/education/education-labels';
import { AlertTriangle } from 'lucide-react';
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function sanitizeModalLinkUrl(rawUrl: string): string {
  const value = String(rawUrl || '').trim();
  if (!value || CONTROL_CHARS.test(value)) return '';
  if (!/^https?:\/\//i.test(value)) return '';
  try {
    const parsed = new URL(value);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'https:' && protocol !== 'http:') return '';
    if (!parsed.hostname || parsed.username || parsed.password) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function htmlToSafeText(input: string): string {
  const withoutScripts = String(input || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withLinks = withoutScripts.replace(
    /<a[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_full, _quote, href, text) => {
      const safeHref = sanitizeModalLinkUrl(String(href || ''));
      const cleanText = String(text || '').replace(/<[^>]+>/g, ' ').trim();
      if (!safeHref || !cleanText) return cleanText;
      return `[${cleanText}](${safeHref})`;
    },
  );
  return withLinks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(strong|b)>/gi, '**')
    .replace(/<\/?(em|i)>/gi, '*')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const parseText = (text: string, answers?: Answers): React.ReactNode => {
  if (answers) {
    text = text.replace(
      /\[programCategory\]|\[program category\]|\[selected program category\]/gi,
      answers.programCategory || 'the selected program',
    );
    const eduLabel = getEducationLabel(answers.highestEducation || '');
    text = text.replace(/\[highestEducation\]|\[highest education attainment\]/gi, eduLabel || 'their previous study');
  }
  if (text.startsWith('[red warning icon]')) {
    const message = text.replace('[red warning icon]', '').trim();
    return (
      <span className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <span className="text-destructive/90">{parseText(message, answers)}</span>
      </span>
    );
  }
  if (text.startsWith('[red blinking warning icon]')) {
    const message = text.replace('[red blinking warning icon]', '').trim();
    return (
      <span className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <span className="text-destructive/90">{parseText(message, answers)}</span>
      </span>
    );
  }
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[#004097]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = sanitizeModalLinkUrl(linkMatch[2]);
      if (!linkUrl) return linkText;
      return (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          key={i}
          className="text-blue-600 hover:underline"
        >
          {linkText}
        </a>
      );
    }
    return part;
  });
};

export const renderDescriptionItem = (
  item: string | { list?: string[]; table?: any },
  key: number | string,
  answers?: Answers,
) => {
  if (typeof item === 'string') {
    if (item === '[DEPENDENTS_INFO]') {
      const showDependentsInfo =
        answers?.maritalStatus === 'Married'
        || answers?.maritalStatus === 'De Facto'
        || (answers?.numberOfChildren && parseInt(answers.numberOfChildren, 10) > 0);

      if (showDependentsInfo) {
        return (
          <div key={key}>
            <p className="font-bold text-[#004097]">Dependents Information</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-gray-400">
              <li className="pl-1">In New Zealand, the ability to bring dependents is strictly tied to the student's level of study.</li>
              <li className="pl-1">**Eligibility:** Generally, only students studying **Level 9 or 10 (Master's/PhD)** or a **Level 7/8 qualification on the Green List** can support a work visa for a partner and student visas for children.</li>
              <li className="pl-1">**Letter of Intent:** Each dependent needs a Letter of Intent explaining why they are accompanying the student.</li>
              <li className="pl-1">**Custody:** For minor children, the student must provide a PSA Birth Certificate. If only one parent is traveling, a notarized Affidavit of Consent from the non-traveling parent is required.</li>
            </ul>
          </div>
        );
      }
      return null;
    }

    if (item.includes('[PAL_MENTION]')) {
      const isMastersOrPhd =
        answers?.programCategory === 'Master Degree'
        || answers?.programCategory === 'Doctorate (PhD)';
      const palText = !isMastersOrPhd ? 'and PAL' : '';
      const updatedItem = item.replace('[PAL_MENTION]', palText);
      return <p key={key}>{parseText(updatedItem, answers)}</p>;
    }

    if (item === '[BACHELOR_PGWP_DURATION]') {
      if (answers?.programCategory === "Bachelor's Degree") {
        return <p key={key}>**Bachelor's Degree (3-4 years):** Eligible for a 3-year PGWP.</p>;
      }
      return null;
    }

    if (item === '[PROFESSIONAL_PGWP_DURATION]') {
      if (answers?.programCategory === 'Professional Degree') {
        return (
          <div key={key}>
            <p>**Professional Degrees:** Eligible for a 3-year PGWP.</p>
            <p className="text-sm text-muted-foreground italic pl-4">Examples of Professional Degrees: Bachelor of Law (LLB/JD), Bachelor of Nursing, Bachelor of Education, Bachelor of Engineering, etc.</p>
          </div>
        );
      }
      return null;
    }

    if (item === '[MASTERS_PGWP_DURATION]') {
      if (answers?.programCategory === 'Master Degree') {
        return (
          <p key={key}>
            **Master Degree:** Eligible for a **3-year PGWP**, even if the program was only 8-12 months (New 2025 rule).
          </p>
        );
      }
      return null;
    }

    if (item === '[PHD_PGWP_DURATION]') {
      if (answers?.programCategory === 'Doctorate (PhD)') {
        return (
          <p key={key}>
            **PhD Degree:** Automatically eligible for a **3-year PGWP**.
          </p>
        );
      }
      return null;
    }

    if (item === '[SPOUSAL_OPEN_WORK_PERMIT_INFO]') {
      const isBringingPartner = ['Spouse/De Facto', 'Spouse/De Facto and Child/ren'].includes(
        answers?.visaAssistance || '',
      );
      if (isBringingPartner) {
        return (
          <div key={key}>
            <h4 className="font-bold text-base mt-4 text-[#004097]">4. Exclusive Spousal Open Work Permit (SOWP)</h4>
            <p>In 2025, Master and PhD students are among the few categories still allowed to bring their partners.</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-gray-400 mt-2">
              <li className="pl-1">**Eligibility:** To qualify for a Spousal Open Work Permit, the student must be enrolled in a Doctoral program or a Master's program that is at least 16 months in duration.</li>
              <li className="pl-1">**Professional Exception:** Select professional degrees (like Law or Medicine) also qualify for this benefit.</li>
            </ul>
          </div>
        );
      }
      return null;
    }

    if (item.startsWith('<') && item.endsWith('>')) {
      const sanitized = htmlToSafeText(item);
      return sanitized ? <p key={key}>{parseText(sanitized, answers)}</p> : null;
    }
    return <p key={key}>{parseText(item, answers)}</p>;
  }

  if (typeof item === 'object' && item.list) {
    return (
      <ul key={key} className="list-disc pl-5 space-y-1.5 marker:text-gray-400">
        {item.list.map((listItem, liIndex) => (
          <li key={liIndex} className="pl-1">
            {parseText(listItem, answers)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof item === 'object' && item.table) {
    return (
      <div key={key} className="overflow-x-auto">
        <table className="w-full text-left border-collapse mt-2">
          <thead>
            <tr>
              {item.table.headers.map((header: string, hIndex: number) => (
                <th key={hIndex} className="p-2 border-b-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.table.rows.map((row: string[], rIndex: number) => (
              <tr key={rIndex} className="hover:bg-gray-50">
                {row.map((cell: string, cIndex: number) => (
                  <td key={cIndex} className="px-1 py-2 border-b border-gray-200 text-sm text-gray-700">{parseText(cell, answers)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

