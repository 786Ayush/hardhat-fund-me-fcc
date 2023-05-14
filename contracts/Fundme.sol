// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error Fundme__NotOwner();
/** @title A contract for crowd funding
 *  @author ayush gupta
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    address public  immutable  owner;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != owner) revert Fundme__NotOwner();
        _;
    }
    constructor(address priceFeed) {
        owner = msg.sender;
        s_priceFeed= AggregatorV3Interface(priceFeed); 
    }

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }
    
    // function getVersion() public view returns (uint256){
    //     // ETH/USD price feed address of Sepolia Network.
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return priceFeed.version();
    // }
    
    
    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex=0;
            funderIndex < funders.length; 
            funderIndex++
            ){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender)/*owner*/.call{
            value: address(this).balance
        }(" ");
        require(callSuccess, "Transaction failed");
    }
    function cheaperWithdraw() public payable onlyOwner{
        address[] memory m_funders=funders;
        address funder;
        for (
            uint256 funderIndex=0;
            funderIndex < m_funders.length; 
            funderIndex++
            ){
            funder = m_funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender)/*owner*/.call{
            value: address(this).balance
        }(" ");
        require(callSuccess, "Transaction failed");
    }
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }
    function getAddressToAmountFunded(address fundingAddress) public view returns(uint256)
    {
        return addressToAmountFunded[fundingAddress];
    }
    function getVersion() public view returns(uint256)
    {
        return s_priceFeed.version();
    }
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
    function getFunder(uint256 index) public view returns(address) {
        return funders[index]; 
    }
}