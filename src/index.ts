import { Router } from 'itty-router';
import { defang, refang } from "fanger";
import Package from '../package-lock.json';

export interface Env {}
const router = Router();

router.get('/version', async (request) => {
	return new Response(Package.version, {
		headers: {
			'Content-Type': 'text/plain'
		}
	})
});

router.all('/', async (request, env, context) => {
	// First, grab some request information
	let url: any = new URL(request.url)
	let hostname: any = url.hostname;

	// Now, we refuse anything that isn't GET or POST
	if (!['GET', 'POST'].includes(request.method)) {
		return new Response('Not Found.', { status: 404 })
	}

	// Now get the subject of our request
	let subject: any;
	if (request.method == "GET") {
		if (request.query.url) {
			subject = request.query.url;
		}
		else {
			return new Response('Missing query in ?url=', { status: 400 })
		}
	}

	if (request.method == "POST") {
		let formData = await request.formData();
		if (formData.get('url')) {
			subject = formData.get('url');
		}
		else {
			return new Response('Missing url in formData', { status: 400 })
		}

	}

	// Now, we figure out what they want to do
	let resp: any;
	if (hostname.includes('de.fang')) resp = defang(subject)
	if (hostname.includes('re.fang')) resp = refang(subject)

	return new Response(resp, {
		headers: {
			'Content-Type': 'text/plain'
		}
	})
});

router.all("*", () => new Response("404, not found!", { status: 404 }))

export default {
	fetch: router.fetch
}
