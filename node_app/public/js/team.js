/**
 * Team Page JavaScript
 * Displays team member information
 */

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'Ahmed Hamada Makhlouf',
    role: 'DevOps Engineer',
    email: 'Email will be added later',
    github: 'https://github.com',
    bio: 'DevOps specialist focused on automation, CI/CD pipelines, and cloud infrastructure management.',
    avatar:
      'https://ui-avatars.com/api/?name=Ahmed+Hamada+Makhlouf&size=200&background=2563eb&color=fff&bold=true',
  },
  {
    id: 2,
    name: 'Abdelrahman Essam',
    role: 'DevOps Engineer',
    email: 'Email will be added later',
    github: 'https://github.com',
    bio: 'DevOps specialist focused on automation, CI/CD pipelines, and cloud infrastructure management.',
    avatar:
      'https://ui-avatars.com/api/?name=Abdelrahman+Essam&size=200&background=16a34a&color=fff&bold=true',
  },
  {
    id: 3,
    name: 'Youssef Wahed',
    role: 'DevOps Engineer',
    email: 'Email will be added later',
    github: 'https://github.com',
    bio: 'DevOps specialist focused on automation, CI/CD pipelines, and cloud infrastructure management.',
    avatar:
      'https://ui-avatars.com/api/?name=Youssef+Wahed&size=200&background=d97706&color=fff&bold=true',
  },
  {
    id: 4,
    name: 'Ola Rashad',
    role: 'DevOps Engineer',
    email: 'Email will be added later',
    github: 'https://github.com',
    bio: 'DevOps specialist focused on automation, CI/CD pipelines, and cloud infrastructure management.',
    avatar:
      'https://ui-avatars.com/api/?name=Ola+Rashad&size=200&background=dc2626&color=fff&bold=true',
  },
  {
    id: 5,
    name: 'Meirhan Ezzeldeen',
    role: 'DevOps Engineer',
    email: 'Email will be added later',
    github: 'https://github.com',
    bio: 'DevOps specialist focused on automation, CI/CD pipelines, and cloud infrastructure management.',
    avatar:
      'https://ui-avatars.com/api/?name=Meirhan+Ezzeldeen&size=200&background=0891b2&color=fff&bold=true',
  },
];

/**
 * Initialize team page on load
 */
document.addEventListener('DOMContentLoaded', () => {
  renderTeamMembers();
});

/**
 * Render all team members
 */
function renderTeamMembers() {
  const teamGrid = document.getElementById('teamGrid');

  if (!teamGrid) {
    console.error('Team grid element not found');
    return;
  }

  // Clear loading state
  teamGrid.innerHTML = '';

  // Render team member cards
  const cardsHtml = teamMembers
    .map((member) => createMemberCard(member))
    .join('');
  teamGrid.innerHTML = cardsHtml;
}

/**
 * Create a team member card
 * @param {object} member - Team member data
 * @returns {string} HTML for team member card
 */
function createMemberCard(member) {
  return `
    <div class="team-card">
      <img 
        src="${escapeHtml(member.avatar)}" 
        alt="${escapeHtml(member.name)}" 
        class="team-avatar"
        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
          member.name
        )}&size=200&background=6b7280&color=fff'"
      >
      <h3 class="team-name">${escapeHtml(member.name)}</h3>
      <p class="team-role">${escapeHtml(member.role)}</p>
      <p class="team-bio">${escapeHtml(member.bio)}</p>
      <div class="team-links">
        <a href="mailto:${escapeHtml(
          member.email
        )}" class="team-link" title="Email ${escapeHtml(member.name)}">
          📧 Email
        </a>
        <a href="${escapeHtml(
          member.github
        )}" target="_blank" rel="noopener noreferrer" class="team-link" title="GitHub Profile">
          🔗 GitHub
        </a>
      </div>
    </div>
  `;
}

/**
 * Add animation on scroll (optional enhancement)
 */
function initScrollAnimations() {
  const cards = document.querySelectorAll('.team-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}

// Initialize animations after rendering
setTimeout(() => {
  initScrollAnimations();
}, 100);
