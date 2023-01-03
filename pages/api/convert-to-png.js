import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { convert } from 'convert-svg-to-png';
import fs from 'fs';

export default withApiAuthRequired(async function myApiRoute(request, response) {
    const { user } = await getSession(request, response);
    //svg data set as part of api call
    const data = request.query.data;
    //convert svg to png
    const png = await convert(data);
    //respond with png
    response.send(png);
});