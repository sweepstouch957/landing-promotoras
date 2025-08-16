import axios from "axios";

const apiSweepstouch = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_SWEEPSTOUCH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
export { apiSweepstouch };
