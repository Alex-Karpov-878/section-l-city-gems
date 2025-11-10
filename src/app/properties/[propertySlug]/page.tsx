import PropertyClientPage from './PropertyClientPage';
import 'server-only';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PropertyPage');

export default function PropertyPage() {
  logger.debug(
    'Rendering PropertyPage boundary - deferring to client component',
  );
  return <PropertyClientPage />;
}
