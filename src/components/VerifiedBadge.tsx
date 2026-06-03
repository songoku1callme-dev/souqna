import { useTranslation } from 'react-i18next';

import { Badge } from './ui/Badge';

export function VerifiedBadge({ small }: { small?: boolean }) {
  const { t } = useTranslation();
  return (
    <Badge label={t('home.verifiedBadge')} tone="verified" icon="shield-checkmark" small={small} />
  );
}
