import {
  useState,
  useEffect,
} from "react";
import axios from 'axios';
import { base_url } from '../common/constants';

const useFetch = (tree_url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const url = tree_url;

  useEffect(() => {
    async function fetchData() {
      if (tree_url) {
        setIsError(false);
        setIsLoading(true);

        try {
          const result = await axios({
            url,
            base_url,
            method: 'get',
          })
          setData(result.data);
        } catch (error) {
          console.error(error);
          setIsError(true);
        }

        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, tree_url]);

  return { data, isLoading, isError };
}

export default useFetch;
