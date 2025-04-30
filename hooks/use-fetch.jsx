const { useState } = require("react");
const { toast } = require("sonner");

const useFetch = (cb) => {
    const [data, setData] = useState(undefined);
    const [error, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const fn = async (...args) => {
        setLoading(true);
        setErrors(null);

        try {
            const res = await cb(...args);
            setData(res);
            setErrors(null);
        } catch (error) {
            setErrors(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, error, fn, setData };
}

export default useFetch;