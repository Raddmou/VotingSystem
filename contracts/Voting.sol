// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title voting
 * @author Mourad M.
 * @notice Implementation of Voting system. Exercice for Alyra
           Voting is not secret
           Each voter can see other people's votes
           The winner is determined by simple majority
           The proposal which obtains the most votes wins.
           The voting process:
           The voting administrator records a whitelist of voters identified by their Ethereum address.
           The voting administrator begins the recording session for the proposal.
           Registered voters are allowed to register their proposals while the registration session is active.
           The voting administrator ends the proposal recording session.
           The voting administrator begins the voting session.
           Registered voters vote for their favorite proposals.
           The voting administrator ends the voting session.
           The vote administrator counts the votes.
           Anyone can check the final details of the winning proposal.
 */

contract Voting is Ownable {

    /**
     * @notice represents the identifier of the winner proposal.
     * @dev equals 0 before vote tailling.
     */
    uint private _winnerVotedProposalId;

    /**
     * @notice determines if there is an equality winners.
     * @dev equals false before vote tailling.
     */
    bool private _equalityWinners = false;

    /**
     * @notice represents the current voting status.
     * @dev initialized to RegisteringVoters status.
     */
    WorkflowStatus private _currentVotingStatus =  WorkflowStatus.RegisteringVoters;

    /**
     * @notice used to increment proposals identifiers.
     * @dev initialized to 0.
     */
    uint private _proposalIdIncrement;

     /** @notice struct for a voter
        @param isRegistered define if voter is registred for voting
        @param hasVoted define if voter has voted
        @param votedProposalId represents the identifier of the voted proposal by voter
    */ 
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /** @notice struct for a proposal
        @param description represents the description of proposal
        @param voteCount represents the voting count of proposal by voters
    */ 
    struct Proposal {
        string description;
        uint voteCount;
    }

    /** @notice enum for workflow voting status
        @param RegisteringVoters voting status wich allows registring voter by admin
        @param ProposalsRegistrationStarted voting status wich allows registring proposals by voters
        @param ProposalsRegistrationEnded voting status wich locks registring proposals by voters
        @param VotingSessionStarted voting status wich allows voting proposals by voters
        @param VotingSessionEnded voting status wich locks voting proposals by voters
        @param VotesTallied voting status wich tally votes and determinate the potential winner
    */ 
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @notice represents the voters identified by their addresses.
     */
    mapping(address => Voter) public voters;

    /**
     * @notice represents voters proposals.
     */
    mapping(uint => Proposal) public proposals;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChanged(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    /**
     * @dev Throws if called by any address account not registred.
     */
    modifier onlyRegistered(){
        require(voters[msg.sender].isRegistered == true, "address not registered as voter");
        _;
    }

    /**
     * @dev Throws if called during an inappropriate voting status.
     */
    modifier onlyOnStatus(WorkflowStatus status){
        require(_currentVotingStatus == status, "Inapproriate call during current voting status");
        _;
    }

    modifier onlyOnStatusWithMessage(WorkflowStatus status, string memory message){
        require(_currentVotingStatus == status, message);
        _;
    }

    /**
     * @notice change status and trigger WorkflowStatusChange event.
     */
    function changeStatus(WorkflowStatus status) internal onlyOwner {
        require(_currentVotingStatus != WorkflowStatus.VotesTallied, "Voting is over");

        emit WorkflowStatusChanged(_currentVotingStatus, status);
        _currentVotingStatus = status;
    }

    /**
     * @notice returns the identifier, description and vote count of the proposal winner
     */
    function getWinner() external view onlyOnStatusWithMessage(WorkflowStatus.VotesTallied, "Votes not tallied yet") returns (uint winnerProposalId, string memory winnerProposalDescription, uint winnerVoteCount) {
        require(_winnerVotedProposalId > 0 && !_equalityWinners, "No winner determined");
        winnerProposalId = _winnerVotedProposalId;
        winnerProposalDescription = proposals[_winnerVotedProposalId].description;
        winnerVoteCount = proposals[_winnerVotedProposalId].voteCount;
    }

    /**
     * @notice register a voter by his address.
     * @param addressToRegister address voter to register
     * Can only be called by the admin.
     */
    function registerVoter(address addressToRegister) external onlyOnStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        require(!voters[addressToRegister].isRegistered, "Voter already registred");
        voters[addressToRegister].isRegistered = true;
        emit VoterRegistered(addressToRegister);
    }

    /**
     * @notice start proposal registration session.
     * Can only be called by the admin.
     */
    function startProposalsRegistration() external onlyOnStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        changeStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice register a proposal
     * @param proposalDescription proposal description to register
     * Can only be called by a registred voter.
     */
    function registerProposal(string memory proposalDescription) external onlyOnStatus(WorkflowStatus.ProposalsRegistrationStarted) onlyRegistered {   
        require(bytes(proposalDescription).length != 0, "Register proposal can not be empty");    

        proposals[++_proposalIdIncrement].description = proposalDescription;
        emit ProposalRegistered(_proposalIdIncrement);
    }

    /**
     * @notice end proposal registration session.
     * Can only be called by the admin.
     * Can only be called during voting session.
     */
    function endProposalsRegistration() external onlyOnStatus(WorkflowStatus.ProposalsRegistrationStarted) onlyOwner {
        changeStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @notice start proposal voting session.
     * Can only be called by the admin.
     * Can only be called after voting registration session.
     */
    function startVotingSession() external onlyOnStatus(WorkflowStatus.ProposalsRegistrationEnded) onlyOwner {
        changeStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice vote for a proposal
     * @param proposalId proposal identifier to vote for
     * Can only be called by a registred voter.
     * Can only be called during voting session.
     */
    function vote(uint proposalId) external onlyOnStatus(WorkflowStatus.VotingSessionStarted) onlyRegistered {
        require(voters[msg.sender].hasVoted == false, "Voter has already voted");   
        require(bytes(proposals[proposalId].description).length != 0, "proposal Id don't exists");            

        proposals[proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        emit Voted(msg.sender, proposalId);

        if(proposalId == _winnerVotedProposalId)
        {
            _equalityWinners = false;
        }
        else if(proposals[proposalId].voteCount == proposals[_winnerVotedProposalId].voteCount)
        {
            _equalityWinners = true;
        }
        else if(proposals[proposalId].voteCount > proposals[_winnerVotedProposalId].voteCount)
        {
            _winnerVotedProposalId = proposalId;
            _equalityWinners = false;
        }
    }

    /**
     * @notice end proposal voting session.
     * Can only be called by the admin.
     * Can only be called during voting session.
     */
    function endVotingSession() external onlyOnStatus(WorkflowStatus.VotingSessionStarted) onlyOwner {
        changeStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice tally votes to determinate a proposal winner.
     * Can only be called by the admin.
     */
    function tallyVotes() external onlyOnStatus(WorkflowStatus.VotingSessionEnded) onlyOwner {
        changeStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @notice returns the current voting status
     */
    function getCurrentVotingStatus() external view returns (uint8) {
        return (uint8)(_currentVotingStatus);
    }

    /**
     * @notice returns the current voting status
     */
    function getCurrentVotingStatusKey() external view returns (string memory) {
        return getStatusKey(_currentVotingStatus);
    }

    /**
     * @dev is there a best pratice to get enum key from value in solidity??
     */
    function getStatusKey(WorkflowStatus status) internal pure returns (string memory) {        
        if (status == WorkflowStatus.RegisteringVoters) return "RegisteringVoters";
        if (status == WorkflowStatus.ProposalsRegistrationStarted) return "ProposalsRegistrationStarted";
        if (status == WorkflowStatus.ProposalsRegistrationEnded) return "ProposalsRegistrationEnded";
        if (status == WorkflowStatus.VotingSessionStarted) return "VotingSessionStarted";
        if (status == WorkflowStatus.VotingSessionEnded) return "VotingSessionEnded";
        if (status == WorkflowStatus.VotesTallied) return "VotesTallied";
        return "undefined";
    }
}