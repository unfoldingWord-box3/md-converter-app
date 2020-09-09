import {
  useState,
  useEffect,
} from 'react';
import ric from 'ric-shim';
import * as cacheLibrary from 'money-clip';
import { base_url } from '../common/constants';
import useLoading from './useLoading';

const useFetch = (tree_url, id) => {
  const [data, setData] = useState(null);
  const { isLoading, isError, setIsLoading, setIsError } = useLoading();
  const url = tree_url ? `${base_url}/${tree_url}` : null;

  useEffect(() => {
    async function fetchData() {
      if (tree_url) {
        setIsError(false);
        setIsLoading(true);

        const cachedResult = await cacheLibrary.getAll().then(cacheData => cacheData ? cacheData[id] : null);

        try {
          if (cachedResult) {
            setData(cachedResult);
          } else if (navigator.onLine) {
            const result = await fetch(url).then(data => data.json())
            ric(() => cacheLibrary.set(id, result));
            setData(result);
          } else {
            setData(null);
          }
        } catch (error) {
          console.error(error);
          setIsError(true);
        }

        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, tree_url, id, setIsError, setIsLoading]);

  return { data, isLoading, isError };
}

export default useFetch;
