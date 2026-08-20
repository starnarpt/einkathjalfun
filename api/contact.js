const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, package: selectedPackage, location, goals, website } = request.body || {};

  if (website) return response.status(200).json({ ok: true });
  if (!name || !email || !goals || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ error: 'Vinsamlegast fylltu út nauðsynlega reiti.' });
  }

  const safe = {
    name: escapeHtml(name).slice(0, 120),
    email: escapeHtml(email).slice(0, 200),
    phone: escapeHtml(phone || 'Ekki gefið upp').slice(0, 80),
    selectedPackage: escapeHtml(selectedPackage || 'Ekki valið').slice(0, 160),
    location: escapeHtml(location || 'Ekki valið').slice(0, 120),
    goals: escapeHtml(goals).slice(0, 4000).replaceAll('\n', '<br>'),
  };

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'SA Fitness <fyrirspurn@safitness.is>',
        to: [process.env.CONTACT_TO_EMAIL || 'stefanarnar.pt@gmail.com'],
        reply_to: email,
        subject: `Ný fyrirspurn frá ${String(name).slice(0, 120)} — SA Fitness`,
        html: `<h2>Ný fyrirspurn af safitness.is</h2>
          <p><strong>Nafn:</strong> ${safe.name}</p>
          <p><strong>Netfang:</strong> ${safe.email}</p>
          <p><strong>Símanúmer:</strong> ${safe.phone}</p>
          <p><strong>Þjónusta:</strong> ${safe.selectedPackage}</p>
          <p><strong>Stöð:</strong> ${safe.location}</p>
          <p><strong>Markmið:</strong><br>${safe.goals}</p>`,
      }),
    });

    if (!resendResponse.ok) throw new Error('Resend rejected the message');
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return response.status(500).json({ error: 'Ekki tókst að senda fyrirspurnina.' });
  }
}
