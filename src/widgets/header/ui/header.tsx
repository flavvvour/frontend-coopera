import './sidebar.css';
export const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1>Мой новый проект</h1>
                    <p>Мой новый проект, в котором я буду делать что-то новенькое</p>
                </div>
                <div className="header-right">
                    <button className="user-menu">👤</button>
                </div>
            </div>
        </header>
    );
};