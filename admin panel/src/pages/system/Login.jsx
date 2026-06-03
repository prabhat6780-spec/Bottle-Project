import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/loginSlice';
import bgImage from '../../assets/background.jpg';
import logo from '../../assets/hero.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="login-page-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="techerp-card fade-in-up">
        <div className="techerp-content">
          <div className="techerp-logo-container">
            <img src={logo} alt="Shayona Glass" className="login-logo-img" />
          </div>

          <h2 className="techerp-welcome text-center" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Login</h2>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2 mb-4 border-0 rounded-3 small" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <div className="techerp-input-group">
              <label className="techerp-label">Email <span>*</span></label>
              <div className="techerp-input-container">
                <input
                  type="email"
                  className="techerp-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="techerp-input-group">
              <label className="techerp-label">Password <span>*</span></label>
              <div className="techerp-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="techerp-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="techerp-icon-box"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </div>
              </div>
            </div>

            <button type="submit" className="techerp-login-btn w-100" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}