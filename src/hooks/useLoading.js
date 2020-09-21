import { useState } from 'react';

const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);

  return {
    isError,
    isLoading,
    setIsError,
    setIsLoading,
    setLoadingMessage,
    loadingMessage,
  };
}

export default useLoading;
