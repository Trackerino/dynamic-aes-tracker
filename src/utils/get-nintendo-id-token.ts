export default async (nasid: string) => {
  const res = await fetch('https://accounts.nintendo.com/connect/1.0.0/authorize/consent?client_id=1f6a6a4806931686&redirect_uri=https%3A%2F%2Faccounts.epicgames.com%2FOAuthAuthorized&display=popup&state=egs&force_verify=true&scope=openid+user.screenName&response_type=id_token', {
    headers: {
      Cookie: `NASID=${nasid}`,
    },
    redirect: 'manual',
  });

  const locationHeader = String(res.headers.get('location'));
  const match = locationHeader.match(/id_token=([A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*)/);

  if (!match) {
    throw new Error('Unable to get Nintendo ID token');
  }

  return match[1];
};
