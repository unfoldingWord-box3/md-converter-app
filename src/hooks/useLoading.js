import { useState } from 'react';

const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  return { isLoading, isError, setIsLoading, setIsError };
}

export default useLoading;
