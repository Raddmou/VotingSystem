import React, { Component, useState, useEffect, useContext } from "react";
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { providerContext } from "../App";
import { statusContext, voterContext, proposalsContext, winnerContext } from "./MainComponent";

const VotingComponents = (props) => {
    const provider = useContext(providerContext);
	const [isOwner, setIsOwner] = useState(props.isOwner);
    const currentState = useContext(statusContext);
	const voter = useContext(voterContext);
	const winner = useContext(winnerContext);
	const [proposals, setProposals] = useState([]); 
	const [address, setAddress] = useState(null);
    const [proposal, setProposal] = useState(null);


	

    useEffect(() => {
		(async () => {
            await provider.contract.getPastEvents('ProposalRegistered',{fromBlock: 0, toBlock: 'latest'},
                async (error, events) => {
                    if(!error){
						events.map(async (proposal) => {
                            const idProposal = proposal.returnValues.proposalId;
                            const proposalResponse = await provider.contract.methods.proposals(idProposal).call();
							const proposalToAdd = {proposalId: idProposal, proposalDescription: proposalResponse.description}
                            console.log("Index " +  proposals.indexOf(proposalToAdd.description));
							setProposals(proposals => [...proposals, proposalToAdd]);  
                        })
                        // events.map(async (proposal) => {
                        //     const idProposal = proposal.returnValues.proposalId;
                        //     const proposalResponse = await provider.contract.methods.proposals(idProposal).call();
						// 	const proposalToAdd = {proposalId: idProposal, proposalDescription: proposalResponse.description}
                        //     console.log("Index " +  proposals.indexOf(proposalToAdd.description));
						// 	if(proposals.indexOf(proposalToAdd.description) == "-1")
						// 		setProposals(proposals => [...proposals, proposalToAdd]);  
                        // })
                    }
                });
            })();
			// (async () => {
			// 	if(currentState == '5')
			// 	{
			// 		const winnerResponse = await provider.contract.methods.getWinner().call();
			// 		setWinner(winnerResponse);
			// 	}
			// 	})();
	}, [currentState, winner, voter]);

	const getDistinctProposals = (events) => 
	{	
		const duplicateCheck = [];
		events.map((data, index) => {
			if (!duplicateCheck.some(e => e.proposalId == data.proposalId)) {
				duplicateCheck.push(data);
			}
		});
		return duplicateCheck;
	};

    const registerVoter = async () => {
		if(address !== "") { // && web3.utils.isAddress(address)){
			const voterToregister = address;
            console.log("Voter to register " +  voterToregister);
			await provider.contract.methods.registerVoter(voterToregister).send({from: provider.accounts[0]})
			.on("receipt",function(receipt){
				console.log(receipt);  
                setAddress("");
			})
			.on("error",function(error, receipt){
				console.log(error);
				console.log(receipt);
			});			
		}
    };

	const startProposalsRegistration = async () => {
		await provider.contract.methods.startProposalsRegistration().send({from: provider.accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
			// getCurrentVotingStatus();
		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    };

    const registerProposal = async () => { 
		if(proposal != ""){
            const proposalToSubmit = proposal;
			await provider.contract.methods.registerProposal(proposalToSubmit).send({from: provider.accounts[0]})
			.on("receipt",function(receipt){
				console.log(receipt);
                setProposal("");
			})
			.on("error",function(error, receipt){
				console.log(error);
				console.log(receipt);
			});			
		}
    };

	const endProposalsRegistration = async () => {
		await provider.contract.methods.endProposalsRegistration().send({from: provider.accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    };

	const startVotingSession = async () => {
		await provider.contract.methods.startVotingSession().send({from: provider.accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    };


    const vote = async (proposalId) => {
		await provider.contract.methods.vote(proposalId).send({from: provider.accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    };

	const endVotingSession = async () => {
		await provider.contract.methods.endVotingSession().send({from: provider.accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);

		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    }

    const tallyVotes = async () => {
		await provider.contract.methods.tallyVotes().send({from: provider.accounts[0]})
		.on("receipt", async (receipt) => {
			console.log(receipt);
		})
		.on("error",function(error, receipt){
			console.log(error);
			console.log(receipt);
		});
    }

	if(props.isOwner == null || !currentState || !voter)
		return null;

	const getContent = () => {
        switch(currentState) {
			case "0":
                if(isOwner)
                    return (
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Card style={{ width: '20rem' }}>
                                <Card.Header><strong>Register voter</strong></Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address to register" maxLength='256'></input>
                                        <Button onClick={registerVoter } > Ok </Button>
                                    </Form.Group>{' '}
                                    
                                </Card.Body>
                                
                            </Card>
                            <Card style={{ width: '20rem' }}>
                                <Card.Header><strong>Next step</strong></Card.Header>
                                <Card.Body>
                                    <Button onClick={ startProposalsRegistration } > start Proposals Registration </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                else
                    return(
                        <span>Registering voters by administrator in progress</span>
                    );
			case "1":
                if(isOwner)
				return( 
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<Card style={{ width: '20rem' }}>
							<Card.Header><strong>Next step</strong></Card.Header>
							<Card.Body>
								<Button onClick={ endProposalsRegistration } > End proposals registration </Button>
							</Card.Body>
						</Card>
					</div>
				);
                else
                    return(
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Card style={{ width: '20rem' }}>
                                <Card.Header><strong>Register proposal</strong></Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <input value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Enter proposal" maxLength='256'></input>
                                        <Button onClick={ registerProposal } > Ok </Button>
                                    </Form.Group>{' '}
                                </Card.Body>
                            </Card>
                        </div>
                    );
				case "2":
                    if(isOwner)
					return(
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<Card style={{ width: '20rem' }}>
								<Card.Header><strong>Start Voting Session</strong></Card.Header>
								<Card.Body>
									<Button onClick={ startVotingSession } > Ok </Button>
								</Card.Body>
							</Card>
						</div>
					);
                    else
                    return(
                        <span>Register proposals in progress</span>
                    );
				case "3":
                    if(isOwner)
					return(
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<Card style={{ width: '20rem' }}>
								<Card.Header><strong>End Voting Session</strong></Card.Header>
								<Card.Body>
									<Button onClick={ endVotingSession } > Ok </Button>
								</Card.Body>
							</Card>
						</div>
					);
                    else if(!proposals)
                    {
                        return(
                            <span>No proposal to vote for</span>
                        );
                    }
                    else if(voter && voter.hasVoted)
                    {
                        return(
                            <span>You have already voted</span>
                        );
                    }
					else if(voter && !voter.isRegistered)
                    {
                        return(
                            <span>You are not register to vote</span>
                        );
                    }
                    else
                        return( 
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <Card style={{ width: '20rem' }}>
                                    <Card.Header><strong>Vote for one proposal</strong></Card.Header>
                                    <Card.Body>
                                    <table width="75%" display='flex' align-items='center'>
                                        <thead>
                                            <tr>
                                                <th></th>
												<th ></th>
                                            </tr>
											<tr></tr>	
                                        </thead>
                                        <tbody>{getDistinctProposals(proposals).map((proposal) => (
																			<tr>
																			<td>{proposal.proposalDescription}</td>
																			<td><Button onClick={vote.bind(this, proposal.proposalId)} > Vote </Button></td>
																			</tr>
																			)
															)}
										</tbody>
									</table>
                                    </Card.Body>
                                </Card>
						    </div>
                        );
				case "4":
                    if(isOwner)
					return(
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<Card style={{ width: '20rem' }}>
								<Card.Header><strong>Tally Votes</strong></Card.Header>
								<Card.Body>
									<Button onClick={ tallyVotes } > Ok </Button>
								</Card.Body>
							</Card>
							</div>
					);
                    else
                    return(
                        <span>Wainting for taily votes</span>
                    );
                case "5":
                    return(
                        <span>Voting is finished</span>
                    );
			default:
				return null;
		}
	};

	return ( 
            <div>
				<Card style={{ width: '40rem' }}>
					<Card.Header><strong>Voting</strong></Card.Header>
					<Card.Body>
                        {getContent()}
					</Card.Body>		
				</Card>
			</div>
	);
}

export default VotingComponents;