export const WorkflowStatus = [
    "RegisteringVoters",
    "ProposalsRegistrationStarted",
    "ProposalsRegistrationEnded",
    "VotingSessionStarted",
    "VotingSessionEnded",
    "VotesTallied"
];

export const WorkflowStatusLabel = [
    "Registering voters",
    "Proposals registration started",
    "Proposals registration ended",
    "Voting session started",
    "Voting session ended",
    "Votes tallied"
];

export const getWorkFlowStatusKey = (status) => {
    if (status == 0) return "RegisteringVoters";
    if (status == 1) return "ProposalsRegistrationStarted";
    if (status == 2) return "ProposalsRegistrationEnded";
    if (status == 3) return "VotingSessionStarted";
    if (status == 4) return "VotingSessionEnded";
    if (status == 5) return "VotesTallied";
    return "undefined";
};