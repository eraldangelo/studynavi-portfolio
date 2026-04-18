import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { Card, CardContent } from '@/components/ui/layout/card';
import Image from 'next/image';
import { Calendar, Star, ExternalLink, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/display/badge';
import Link from 'next/link';
import IntakeFormatter from './IntakeFormatter';
import { parseUniversityName } from '@/lib/education-providers/university-name';

export const SchoolCard = ({ school }: { school: SchoolTableEntry }) => {
  const parsedUniversity = parseUniversityName(school.university);

  return (
    <Card className="overflow-hidden transition-transform hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 flex-shrink-0 self-center sm:self-start">
            <Image
              src={school.logoUrl}
              alt={`${parsedUniversity.title} logo`}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h3 className="font-bold text-base text-primary">{parsedUniversity.title}</h3>
            {parsedUniversity.details.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                {parsedUniversity.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
              <span>{school.location.map((location) => location.replace(/\*|•/g, '').trim()).filter(Boolean).join(', ')}</span>
            </div>
          </div>
          <div className="flex-shrink-0 self-center sm:self-auto">
            <Badge
              variant={school.priorityLevel === 'High' ? 'destructive' : 'secondary'}
              className={school.priorityLevel === 'High' ? 'bg-green-600 text-white' : ''}
            >
              {school.priorityLevel} Priority
            </Badge>
          </div>
        </div>
        <div className="mt-4 space-y-3 pl-0 sm:pl-24">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">TYPICAL INTAKES</p>
              <IntakeFormatter intakes={school.intakes} className="text-sm" view="grid" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">SIGNATURE PROGRAMS</p>
              <p className="text-sm text-muted-foreground">{school.popularPrograms}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <LinkIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">OFFICIAL WEBSITE</p>
              {school.website ? (
                <Link
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Click Here
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

