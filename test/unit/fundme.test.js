const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
// const { assert } =require("chai");
// describe ("FundMe",async function(){
//   let fundMe;
//   let deployer;
//   let mockV3Aggregator;
//   beforeEach(async function () {
//     deployer = (await getNamedAccounts()).deployer;
//     await deployments.fixture(["all"]);
//     fundMe = await ethers.getContractAt("FundMe", deployer);
//     mockV3Aggregator = await ethers.getContractAt(
//       "MockV3Aggregator",
//       deployer)
//   })

//   describe("constructor", async function () {
//     it("sets the aggregator addresses correctly", async function () {
//       const response = await fundMe.priceFeed();
//       assert.equal(response, mockV3Aggregator.address);
//     });
//   });
//   // describe ("fund",async function () {
//   //   it("Fails if you don't send enough ETH", async function (){
//   //     const response = await fundMe.priceFeed()
//   //     assert.equal(response, MockV3Aggregator.address)
//   //   })
//   // })
// })
// // describe("FundMe", async function(){
// //     beforeEach()
// // })
!developmentChains.includes(network.name)
    ? describle.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer

          const sendValue = ethers.utils.parseEther("1")
          // it means it takes 1 ether. we will use parseEther to get ether/gew
          beforeEach(async () => {
              // const accounts = await ethers.getSigners()
              // deployer = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.addressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("updated the funders data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder.toString(), deployer.toString())
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single funder", async function () {
                  //arrange
                  const startingfundMebalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundmebalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundmebalance, 0)
                  assert.equal(
                      startingdeployerbalance
                          .add(startingfundMebalance)
                          .toString(),
                      endingdeployerbalance.add(gasCost).toString()
                  )
              })
              it("allow us to withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingfundMebalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundmebalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundmebalance, 0)
                  assert.equal(
                      startingdeployerbalance
                          .add(startingfundMebalance)
                          .toString(),
                      endingdeployerbalance.add(gasCost).toString()
                  )
                  await expect(fundMe.funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allow the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  // const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted
                  // With(
                  //     "FundMe__NotOwner"
                  // )
              })
              it("cheaperwithdraw ETH from a single funder", async function () {
                  //arrange
                  const startingfundMebalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundmebalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingdeployerbalance =
                      await fundMe.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundmebalance, 0)
                  assert.equal(
                      startingdeployerbalance
                          .add(startingfundMebalance)
                          .toString(),
                      endingdeployerbalance.add(gasCost).toString()
                  )
              })
          })
      })
