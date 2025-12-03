import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const ADMIN_CODE = '2604';

export function useAdmin() {
  const [searchParams] = useSearchParams();
  
  const isAdmin = useMemo(() => {
    return searchParams.get('admin') === ADMIN_CODE;
  }, [searchParams]);
  
  return isAdmin;
}
