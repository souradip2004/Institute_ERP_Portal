'use client';

import CreateSmartResourcesNew from '@/components/teacher/CreateSmartResourcesNew';
import { useParams } from 'next/navigation';
export default function Page() {
     const params = useParams();
        const classId = params!.classId as string;
    return <CreateSmartResourcesNew classId={classId}/>;
}



// 'use client';

// import CreateSmartResources from '@/components/teacher/CreateSmartResources';

// export default function Page() {
//     return <CreateSmartResources />;
// }

