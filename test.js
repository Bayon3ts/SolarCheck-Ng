const req = async () => {
  const r = await fetch('http://localhost:3000/api/warranty/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      homeowner_name: 'bayomi Simon',
      homeowner_phone: '08147856011',
      homeowner_email: 'bayomisimon@gmail.com',
      state: 'Osun',
      install_date: '2026-07-22'
    })
  });
  console.log(r.status);
  console.log(await r.text());
};
req();
