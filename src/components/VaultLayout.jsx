import { Link } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import './VaultLayout.css';

/** Signed-in layout shared by the accounts and history pages: the brass spine plus a main column. */
export default function VaultLayout({ className = '', children }) {
  return (
    <div className={`vault-page ${className}`}>
      <div className="vault-shell">
        <aside className="spine">
          <Link to="/" title="Lock and sign out" aria-label="Lock and sign out">
            <BrandMark className="mark" />
          </Link>
          <div className="spine-word">AURUM SAVINGS</div>
          <div className="avatar">RK</div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
