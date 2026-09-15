import { ActivityList } from '@/components/activities';
import { PublicHeader } from '@/components/ui';
export const metadata = { title: 'Explorar atividades' };
export default function Page() { return <><PublicHeader/><main className="explore-main"><ActivityList mode="explore"/></main></>; }
