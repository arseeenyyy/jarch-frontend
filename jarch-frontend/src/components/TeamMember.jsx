import React from 'react';

const TeamMember = ({ member }) => {
    return (
        <div className="team-member">
            <div>
                <strong>{member.username}</strong>
                <br />
                <small>Роль: {member.role} • Доступ: {member.accessLevel}</small>
            </div>
        </div>
    );
};

export default TeamMember;