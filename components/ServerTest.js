import React, { useEffect, useState} from "react";

export default function ServerTest(){
    const [backendData, setBackendData] = useState([{}])

    useEffect(() => {
        fetch("http://localhost:5000/express/api").then(
            response => response.json()
        ).then(
            data => {
                setBackendData(data);
            }
        )
    }, [])

    return (
        <div> <p>{backendData.users}</p></div>
    )
}