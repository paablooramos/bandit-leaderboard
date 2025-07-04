async function fetchLeaderboard() {
  const res = await fetch('/.netlify/functions/getleaderboard');
  if (!res.ok) throw new Error('Error al cargar leaderboard');
  return res.json();
}

function updateLeaderboardUI(data) {
  // Actualizamos top3 cards
  const cards = document.querySelectorAll('.top3 .card');
  const rewards = ['25 Scrap', '45 Scrap', '10 Scrap'];
  // Notar que en tu HTML la orden es 2nd, 1st, 3rd en ese orden de cards
  // Por eso los indices los acomodamos: 1 -> gold, 0 -> silver, 2 -> bronze
  if(data.length > 0) {
    // 2nd place (silver)
    cards[0].querySelector('p:nth-of-type(2)').textContent = data[1]?.name || '???';
    cards[0].querySelector('p:nth-of-type(3)').textContent = `Deposited: ${data[1]?.wager ?? '***'}`;
    // 1st place (gold)
    cards[1].querySelector('p:nth-of-type(2)').textContent = data[0]?.name || '???';
    cards[1].querySelector('p:nth-of-type(3)').textContent = `Deposited: ${data[0]?.wager ?? '***'}`;
    // 3rd place (bronze)
    cards[2].querySelector('p:nth-of-type(2)').textContent = data[2]?.name || '???';
    cards[2].querySelector('p:nth-of-type(3)').textContent = `Deposited: ${data[2]?.wager ?? '***'}`;
  }

  // Actualizamos tabla
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';
  const rewardMap = {
    0: '45 scrap',
    1: '25 scrap',
    2: '10 scrap',
    3: '5 scrap',
    4: 'Free Battle'
  };

  data.forEach((user, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${i+1}</td>
      <td>${user.name}</td>
      <td>${user.wager}</td>
      <td>${rewardMap[i] || '5 scrap'}</td>
    `;
    tbody.appendChild(tr);
  });

  // Si no hay datos, muestra placeholders
  if(data.length === 0){
    tbody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
  }
}

async function main() {
  try {
    const data = await fetchLeaderboard();
    updateLeaderboardUI(data);
  } catch(e) {
    console.error(e);
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '<tr><td colspan="4">Error al cargar datos</td></tr>';
  }
}

main();
