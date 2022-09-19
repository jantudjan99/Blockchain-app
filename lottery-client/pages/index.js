import { useState, useEffect } from 'react'
import Head from 'next/head'
import Web3 from 'web3'
import lotteryContract from '../blockchain-solidity/lottery'
import styles from '../styles/Home.module.css'
import 'bulma/css/bulma.css'

export default function Home() {
  const [error, setError] = useState('')
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPool, setlotteryPool] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [lotteryHistory, setLotteryHistory] = useState([])
  const [lotteryId, setLotteryId] = useState()
  
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    updateState()
  }, [lcContract])

  const updateState = () => {
    if (lcContract) getPot()
    if (lcContract) getPlayers()
    if (lcContract) getLotteryId()
  }

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call()
    setlotteryPool(web3.utils.fromWei(pot, 'ether'))
  }

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call()
    setPlayers(players)
  }

  const getHistory = async (id) => {
    setLotteryHistory([])
    for (let i = parseInt(id); i > 0; i--) {
      console.log('get History')
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call()
      const historyObj = {}
      historyObj.id = i
      historyObj.address = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
    }
  }

  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.lotteryId().call()
    setLotteryId(lotteryId)
    await getHistory(lotteryId)
  }

  const enterLotteryHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      /* Postavljamo vrijednost jednog uloga na 0.005 Ethera */
      await lcContract.methods.enter().send({
        from: address,
        value: '5000000000000000',
        gas: 300000,
        gasPrice: null
      })
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }

  const payWinnerHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      await lcContract.methods.payWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
      console.log(`Id of lottery: ${lotteryId}`)
      const winnerAddress = await lcContract.methods.lotteryHistory(lotteryId).call()
      setSuccessMsg(`Winner of lottery is: ${winnerAddress}`)
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }


  const connectWalletHandler = async () => {
    setError('')
    setSuccessMsg('')
    /* Provjera instalacije Metamaska */
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        /* Traži se konekcija s E-walletom */
        await window.ethereum.request({ method: "eth_requestAccounts"})
        const web3 = new Web3(window.ethereum)
        /* web3 instanca */
        setWeb3(web3)
        /* Dohvati listu računa */
        const accounts = await web3.eth.getAccounts()
        setAddress(accounts[0])

        /* Lokalna kopija ugovora */
        const lc = lotteryContract(web3)
        setLcContract(lc)

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts()
          console.log(accounts[0])
          setAddress(accounts[0])
        })
      } catch(err) {
        setError(err.message)
      }
    } else {
      /* MetaMask nije installiran */
      console.log("Please install MetaMask")
    }
  }


  return (
    <div>
      <Head>
        <title>Lottery application</title>
        <meta name="description" content="An Ethereum Lottery dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
      <div className={styles.imgbg}>
        <img src=""></img>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>Lottery with Ethers (Rinkeby test network)</h1>
            </div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-link">Connect your Wallet</button>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-5">
                  <b><p>Join the lottery (0.005 Ether cost)</p></b>
                  <button onClick={enterLotteryHandler} className="button button-color is-large is-light mt-3">Play now</button>
                </section>
                <section className="mt-6">
                  <p><b>Pay winner</b></p>
                  <button onClick={payWinnerHandler} className="button is-success is-large is-light mt-3">Pay Winner</button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <p>{successMsg}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is-one-third`}>
              <section className="mt-5">
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2> Players in game : {lotteryPlayers.length}</h2>
                        <ul className="ml-0"><b>Player's wallet id:</b>
                        {
                            (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index) => {
                              return <p key={`${player}-${index}`}>{index+1}. player: <br></br>
                                <li><a href={`https://etherscan.io/address/${player}`} target="_blank">
                                  {player}
                                </a></li>
                              </p>
                              
                            })
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Pool</h2>
                        <p>Total of {lotteryPool} Ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Block Explorer</p>
      </footer>
    
    </div>
  )
}
