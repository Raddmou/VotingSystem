const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];
    const voter02 = accounts[2];
    const voter03 = accounts[3];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
    });

    describe('Register voters', () => {
        it('Voting session initialized in register voters status', async function () {
            let currentStatus = await this.votingInstance.getCurrentVotingStatus();
            let expectedStatus = voting.WorkflowStatus.RegisteringVoters;
            expect(currentStatus).to.be.bignumber.equal(new BN(expectedStatus));
        });
    
        it('Admin address can register voter on registring voters status', async function () {
            let receipt = await this.votingInstance.registerVoter(voter01, {from: admin});
            expectEvent(receipt, 'VoterRegistered', {voterAddress: voter01});
        });
    
        it('Admin address can register voters on registring voters status', async function () {
            let receipt = await this.votingInstance.registerVoters([voter01, voter02], {from: admin});
            expectEvent(receipt, 'VoterRegistered', {voterAddress: voter01});
            expectEvent(receipt, 'VoterRegistered', {voterAddress: voter02});
        });
    
        it('Non admin address trying to register voters on registring voters status should revert', async function () {
            await expectRevert(
                this.votingInstance.registerVoters([voter01, voter02], {from: voter02}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin address cannot register a voter already registred', async function () {
            await this.votingInstance.registerVoter(voter01, {from: admin});
            await expectRevert(
                this.votingInstance.registerVoter(voter01, {from: admin}),
                "Voter already registred");
        });
    });

    describe('Start proposal registration', () => {
        it('Admin can start proposal registration on registring voters status', async function () {
            let receipt = await this.votingInstance.startProposalsRegistration({from: admin});
            await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.RegisteringVoters), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted)});
        });
    
        it('Non admin cannot start proposal registration on registring voters status', async function () {
            await expectRevert(
                this.votingInstance.startProposalsRegistration({from: voter01}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin cannot start proposal registration on start proposal registration status', async function () {
            let receipt = await this.votingInstance.startProposalsRegistration({from: admin});
            await expectRevert(
                this.votingInstance.startProposalsRegistration({from: admin}),
                "Call is not approriate during the current voting status");
        });
    });

    describe('Register proposal', () => {
        beforeEach(async function () {
            await this.votingInstance.registerVoters([voter01, voter02], {from: admin});
            await this.votingInstance.startProposalsRegistration({from: admin});
        });

        it('Registered voter can register proposal on proposal registration started', async function () {
            let receipt = await this.votingInstance.registerProposal("proposition01", {from: voter01});
            await expectEvent(receipt, 'ProposalRegistered', {proposalId: new BN(1)});
        });
    
        it('Registered voter cannot register proposal on proposal registration ended', async function () {
            await this.votingInstance.endProposalsRegistration({from: admin});
            await expectRevert(
                this.votingInstance.registerProposal("proposition01", {from: voter01}),
                "Call is not approriate during the current voting status");
        });
    
        it('Non registered voter cannot register proposal on proposal registration started', async function () {
            await expectRevert(
                this.votingInstance.registerProposal("proposition01", {from: voter03}),
                "address not registered as voter");
        });
    
        it('Registered voter cannot register an empty proposal on proposal registration started', async function () {
            await expectRevert(
                this.votingInstance.registerProposal("", {from: voter01}),
                "Register proposal can not be empty");
        });
    });

    describe('End register proposal', () => {
        beforeEach(async function () {
            await this.votingInstance.startProposalsRegistration({from: admin});
        });

        it('Admin can end proposal registration on start registration status', async function () {
            let receipt = await this.votingInstance.endProposalsRegistration({from: admin});
            await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded)});
        });
    
        it('Non admin cannot end proposal registration on start registration status', async function () {
            await expectRevert(
                this.votingInstance.endProposalsRegistration({from: voter01}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin cannot end proposal registration on proposal registration status', async function () {
            await this.votingInstance.endProposalsRegistration({from: admin});
            await expectRevert(
                this.votingInstance.endProposalsRegistration({from: admin}),
                "Call is not approriate during the current voting status");
        });
    });

    describe('Start voting', () => {
        beforeEach(async function () {
            await this.votingInstance.startProposalsRegistration({from: admin});
            await this.votingInstance.endProposalsRegistration({from: admin});
        });

        it('Admin can start voting session on end proposal registration status', async function () {
            let receipt = await this.votingInstance.startVotingSession({from: admin});
            await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded), newStatus: new BN(voting.WorkflowStatus.VotingSessionStarted)});
        });
    
        it('Non admin cannot start voting session on end proposal registration status', async function () {
            await expectRevert(
                this.votingInstance.startVotingSession({from: voter01}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin cannot start voting session on start voting session status', async function () {
            await this.votingInstance.startVotingSession({from: admin});
            await expectRevert(
                this.votingInstance.startVotingSession({from: admin}),
                "Call is not approriate during the current voting status");
        });
    });

    describe('Vote', () => {
        beforeEach(async function () {
            await this.votingInstance.registerVoters([voter01, voter02], {from: admin});
            await this.votingInstance.startProposalsRegistration({from: admin});
            await this.votingInstance.registerProposal("proposition01", {from: voter01});
            await this.votingInstance.registerProposal("proposition02", {from: voter02});
            await this.votingInstance.endProposalsRegistration({from: admin});
            await this.votingInstance.startVotingSession({from: admin});
        });
    
        it('Registered voter can vote a existing proposal on voting session status', async function () {
            let receipt = await this.votingInstance.vote(1, {from: voter01});
            await expectEvent(receipt, 'Voted', {voter: voter01, proposalId: new BN(1)});
        });
    
        it('Non registered voter cannot vote a existing proposal on voting session status', async function () {
            await expectRevert(
                this.votingInstance.vote(1, {from: voter03}),
                "address not registered as voter");
        });
    
        it('Registered voter cannot register an non existing proposal on voting session status', async function () {
            await expectRevert(
                this.votingInstance.vote(3, {from: voter01}),
                "proposal Id don't exists");
        });
    
        it('Registered voter cannot vote more than one time a existing proposal on voting session status', async function () {
            await this.votingInstance.vote(1, {from: voter01});
            await expectRevert(
                this.votingInstance.vote(2, {from: voter01}),
                "Voter has already voted");
        });
    });

    describe('End voting', () => {
        beforeEach(async function () {
            await this.votingInstance.startProposalsRegistration({from: admin});
            await this.votingInstance.endProposalsRegistration({from: admin});
            await this.votingInstance.startVotingSession({from: admin});
        });
    
        it('Admin can end voting session on voting session status', async function () {
            let receipt = await this.votingInstance.endVotingSession({from: admin});
            await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.VotingSessionStarted), newStatus: new BN(voting.WorkflowStatus.VotingSessionEnded)});
        });
    
        it('Non admin cannot end voting session on voting session status', async function () {
            await expectRevert(
                this.votingInstance.endVotingSession({from: voter01}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin cannot end voting session on voting session ended status', async function () {
            await this.votingInstance.endVotingSession({from: admin});
            await expectRevert(
                this.votingInstance.endVotingSession({from: admin}),
                "Call is not approriate during the current voting status");
        });
    });

    describe('Tailly votes', () => {
        beforeEach(async function () {
            await this.votingInstance.startProposalsRegistration({from: admin});
            await this.votingInstance.endProposalsRegistration({from: admin});
            await this.votingInstance.startVotingSession({from: admin});
            await this.votingInstance.endVotingSession({from: admin});
        });
    
        it('Admin can tailly votes on end voting session status', async function () {
            let receipt = await this.votingInstance.tallyVotes({from: admin});
            await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.VotingSessionEnded), newStatus: new BN(voting.WorkflowStatus.VotesTallied)});
        });
    
        it('Non admin cannot tailly votes on end voting session status', async function () {
            await expectRevert(
                this.votingInstance.tallyVotes({from: voter01}),
                "Ownable: caller is not the owner");
        });
    
        it('Admin cannot tailly votes on votes tailled session status', async function () {
            await this.votingInstance.tallyVotes({from: admin});
            await expectRevert(
                this.votingInstance.tallyVotes({from: admin}),
                "Call is not approriate during the current voting status");
        });
    });

    describe('Get winner', () => {
        beforeEach(async function () {
            await this.votingInstance.registerVoters([voter01, voter02, voter03], {from: admin});
            await this.votingInstance.startProposalsRegistration({from: admin});
            await this.votingInstance.registerProposal("proposition01", {from: voter01});
            await this.votingInstance.registerProposal("proposition02", {from: voter02});
            await this.votingInstance.endProposalsRegistration({from: admin});
            await this.votingInstance.startVotingSession({from: admin});
            await this.votingInstance.vote(1, {from: voter01});
            await this.votingInstance.vote(2, {from: voter02});
            
        });
    
        it('Winner is the proposal with the most votes on votes tailled session status', async function () {
            await this.votingInstance.vote(2, {from: voter03});
            await this.votingInstance.endVotingSession({from: admin});
            await this.votingInstance.tallyVotes({from: admin});
            let winner = await this.votingInstance.getWinner();
            expect(winner.winnerProposalDescription).to.be.equal("proposition02");
        });
    
        it('No winner on voting session ended status', async function () {
            await this.votingInstance.endVotingSession({from: admin});
            await expectRevert(
                this.votingInstance.getWinner(),
                "Votes not tallied yet");
        });
    
        it('No winner if there was a tie votes on votes tailled session status', async function () {
            await this.votingInstance.endVotingSession({from: admin});
            await this.votingInstance.tallyVotes({from: admin});
            await expectRevert(
                this.votingInstance.getWinner(),
                "No winner determined");
        });
    });
});