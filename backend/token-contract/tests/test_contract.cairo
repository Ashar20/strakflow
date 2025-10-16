use contracts::your_contract::YourContract::FELT_STRK_CONTRACT;
use contracts::your_contract::{IYourContractDispatcher, IYourContractDispatcherTrait};
use contracts::erc20_token::MyToken::{IERC20Dispatcher as MyTokenDispatcher, IERC20DispatcherTrait as MyTokenDispatcherTrait};
use openzeppelin_testing::declare_and_deploy;
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use openzeppelin_utils::serde::SerializedAppend;
use snforge_std::{CheatSpan, cheat_caller_address};
use starknet::ContractAddress;

// Real wallet address deployed on Sepolia
const OWNER: ContractAddress = 0x02dA5254690b46B9C4059C25366D1778839BE63C142d899F0306fd5c312A5918
    .try_into()
    .unwrap();

const STRK_TOKEN_CONTRACT_ADDRESS: ContractAddress = FELT_STRK_CONTRACT.try_into().unwrap();

fn deploy_contract(name: ByteArray) -> ContractAddress {
    let mut calldata = array![];
    calldata.append_serde(OWNER);
    declare_and_deploy(name, calldata)
}

fn deploy_token() -> ContractAddress { declare_and_deploy("MyToken", array![]) }

#[test]
fn test_set_greetings() {
    let contract_address = deploy_contract("YourContract");

    let dispatcher = IYourContractDispatcher { contract_address };

    let current_greeting = dispatcher.greeting();
    let expected_greeting: ByteArray = "Building Unstoppable Apps!!!";
    assert(current_greeting == expected_greeting, 'Should have the right message');

    let new_greeting: ByteArray = "Learn Scaffold-Stark 2! :)";
    dispatcher.set_greeting(new_greeting.clone(), Option::None); // we don't transfer any strk
    assert(dispatcher.greeting() == new_greeting, 'Should allow set new message');
}

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_transfer() {
    let user = OWNER;
    let your_contract_address = deploy_contract("YourContract");

    let your_contract_dispatcher = IYourContractDispatcher {
        contract_address: your_contract_address,
    };
    let erc20_dispatcher = IERC20Dispatcher { contract_address: STRK_TOKEN_CONTRACT_ADDRESS };
    let amount_to_transfer = 500;
    cheat_caller_address(STRK_TOKEN_CONTRACT_ADDRESS, user, CheatSpan::TargetCalls(1));
    erc20_dispatcher.approve(your_contract_address, amount_to_transfer);
    let approved_amount = erc20_dispatcher.allowance(user, your_contract_address);
    assert(approved_amount == amount_to_transfer, 'Not the right amount approved');

    let new_greeting: ByteArray = "Learn Scaffold-Stark 2! :)";

    cheat_caller_address(your_contract_address, user, CheatSpan::TargetCalls(1));
    your_contract_dispatcher
        .set_greeting(
            new_greeting.clone(), Option::Some(amount_to_transfer),
        ); // we transfer 500 wei
    assert(your_contract_dispatcher.greeting() == new_greeting, 'Should allow set new message');
}

#[test]
fn test_erc20_basic() {
    let token_address = deploy_token();

    let token = MyTokenDispatcher { contract_address: token_address };

    assert(token.name() == "MyToken", 'name');
    assert(token.symbol() == "MTK", 'symbol');
    assert(token.decimals() == 18, 'decimals');
    assert(token.total_supply() == 1000000000000000000000, 'total supply');
    assert(
        token.balance_of(
            0x04c23f4996013a9a52c78b9f5ae4d116ac1cb70bb1ed36e193e2901c6479e626
                .try_into()
                .unwrap(),
        ) == 1000000000000000000000,
        'owner balance',
    );
}

#[test]
fn test_erc20_transfer_approve() {
    let token_address = deploy_token();
    let token = MyTokenDispatcher { contract_address: token_address };

    // Transfer some tokens to a user
    let recipient: ContractAddress = 0x1.try_into().unwrap();
    let amount: u256 = 100;

    cheat_caller_address(token_address, OWNER, CheatSpan::TargetCalls(1));
    let ok = token.transfer(recipient, amount);
    assert(ok == true, 'transfer should succeed');
    assert(token.balance_of(recipient) == amount, 'recipient balance');

    // Approve and transfer_from
    let spender: ContractAddress = 0x2.try_into().unwrap();
    cheat_caller_address(token_address, recipient, CheatSpan::TargetCalls(1));
    let ok2 = token.approve(spender, amount);
    assert(ok2 == true, 'approve should succeed');
    assert(token.allowance(recipient, spender) == amount, 'allowance recorded');

    cheat_caller_address(token_address, spender, CheatSpan::TargetCalls(1));
    let ok3 = token.transfer_from(recipient, OWNER, amount);
    assert(ok3 == true, 'transfer_from should succeed');
    assert(token.balance_of(recipient) == 0, 'recipient debited');
}
