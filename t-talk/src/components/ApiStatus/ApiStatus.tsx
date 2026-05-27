import { useEffect, useState } from "react";

interface Status {
  status: string;
  instance: string;
}

export default function ApiStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  
  // Change later because of docker instance
  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(setStatus);
  }, []);
  
  console.log(status)
  
  return (
    <>
      {status
        ? <p>Backend is {status.status} on {status.instance}</p>
        : <p>Loading...</p>
      }
    </>
  )
}