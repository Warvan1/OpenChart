import { useUser } from '@auth0/nextjs-auth0/client';
import { Nav } from 'react-bootstrap'

export default function LoggedIn(props){
    const {user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    if(user == undefined){
        return(
            <div>
                <Nav.Link href="/api/auth/login" style={{color: props.aColor}}>Login</Nav.Link>
            </div>
        )
    }

    return (
        user && (
            <div>
                <Nav.Link href="/api/auth/logout" style={{color: props.aColor}}>Logout</Nav.Link>
            </div>
        )
    );
}