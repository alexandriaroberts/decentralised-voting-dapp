'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import contractABI from '../contractABI.json';

const contractAddress = '0x...'; // Replace with your deployed contract address

export default function VotingDApp() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [newVoteQuestion, setNewVoteQuestion] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState(['', '']);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const votingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(votingContract);

        // Listen for new votes
        votingContract.on('VoteCreated', (voteId, question, options) => {
          setVotes((prevVotes) => [
            ...prevVotes,
            { id: voteId, question, options, counts: options.map(() => 0) },
          ]);
        });

        // Listen for vote casts
        votingContract.on('VoteCast', (voteId, optionIndex, newCount) => {
          setVotes((prevVotes) =>
            prevVotes.map((vote) =>
              vote.id === voteId
                ? {
                    ...vote,
                    counts: vote.counts.map((count, index) =>
                      index === optionIndex ? newCount : count
                    ),
                  }
                : vote
            )
          );
        });

        // Fetch existing votes
        const voteCount = await votingContract.voteCount();
        for (let i = 0; i < voteCount; i++) {
          const [question, options, counts] =
            await votingContract.getVoteDetails(i);
          setVotes((prevVotes) => [
            ...prevVotes,
            { id: i, question, options, counts },
          ]);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const createVote = async () => {
    if (!contract) return;
    try {
      await contract.createVote(
        newVoteQuestion,
        newVoteOptions.filter((option) => option !== '')
      );
      setNewVoteQuestion('');
      setNewVoteOptions(['', '']);
    } catch (error) {
      console.error('Failed to create vote:', error);
    }
  };

  const castVote = async (voteId: number, optionIndex: number) => {
    if (!contract) return;
    try {
      await contract.castVote(voteId, optionIndex);
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold mb-6 text-center'>
        Decentralized Voting dApp
      </h1>
      {!account ? (
        <div className='flex justify-center'>
          <Button onClick={connectWallet} size='lg'>
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div>
          <p className='mb-4 text-center'>Connected: {account}</p>
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Create New Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='question'>Question</Label>
                  <Input
                    id='question'
                    value={newVoteQuestion}
                    onChange={(e) => setNewVoteQuestion(e.target.value)}
                    placeholder='Enter your question'
                  />
                </div>
                {newVoteOptions.map((option, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newVoteOptions];
                        newOptions[index] = e.target.value;
                        setNewVoteOptions(newOptions);
                      }}
                      placeholder={`Enter option ${index + 1}`}
                    />
                    {index > 1 && (
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                          setNewVoteOptions(
                            newVoteOptions.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
                <div className='flex justify-between'>
                  <Button
                    variant='outline'
                    onClick={() => setNewVoteOptions([...newVoteOptions, ''])}
                  >
                    <PlusCircle className='mr-2 h-4 w-4' /> Add Option
                  </Button>
                  <Button onClick={createVote}>Create Vote</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className='space-y-6'>
            {votes.map((vote) => (
              <Card key={vote.id}>
                <CardHeader>
                  <CardTitle>{vote.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {vote.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className='flex justify-between items-center'
                      >
                        <span>{option}</span>
                        <div>
                          <span className='mr-2'>
                            {vote.counts[index]} votes
                          </span>
                          <Button
                            onClick={() => castVote(vote.id, index)}
                            variant='outline'
                          >
                            Vote
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
