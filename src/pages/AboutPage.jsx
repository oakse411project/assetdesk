import team from '../data/team.js';

export default function AboutPage() {
  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1>About AssetDesk</h1>
        <p className="lede">
          AssetDesk keeps track of a company’s IT equipment: who has each laptop, phone or server, where it is, and when
          its warranty runs out. It was built for SE411, Fall 2026–27, Project Part 1.
        </p>
      </header>

      <section aria-labelledby="team-heading">
        <h2 id="team-heading">Team</h2>
        <ul className="team-list">
          {team.map((member) => (
            <li key={member.studentId} className="team-member">
              <span className="team-initials" aria-hidden="true">
                {member.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')}
              </span>
              <span className="team-name">{member.name}</span>
              <span className="team-id">
                Student ID <span className="mono">{member.studentId}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stack-heading" className="about-stack">
        <h2 id="stack-heading">How it’s built</h2>
        <p>
          React 18 with React Router, bundled by Vite. Data is held in memory as a collection of objects for Part 1; a
          backend and database follow in Part 2. Tests use Vitest and React Testing Library.
        </p>
      </section>
    </div>
  );
}
