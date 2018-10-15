import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Container, Loader } from "semantic-ui-react";
import CDPList from "./cdp/List";
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      account: null
    };
  }

  async componentDidMount() {
    const web3 = await getWeb3;
    web3.currentProvider.publicConfigStore.on("update", this.initializeAccount);
    this.initializeAccount();
  }

  initializeAccount = async () => {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    let web3, accs;
    try {
      web3 = await getWeb3;
      accs = await web3.eth.getAccounts();
      if (accs.length === 0) {
        this.setState({ account: "" });
        return;
      }
      if (accs[0] === this.state.account) return;
    } catch (e) {
      console.log(e, "Error finding web3.");
      return;
    }

    try {
      await maker.authenticate();
      const priceService = maker.service("price");
      const cdpService = maker.service("cdp");
      const [
        ethPrice,
        mkrPrice,
        wethToPeth,
        liquidationRatio
      ] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice(),
        priceService.getWethToPethRatio(),
        cdpService.getLiquidationRatio()
      ]);
      this.setState({
        account: accs[0],
        web3,
        ethPrice: ethPrice,
        mkrPrice: mkrPrice,
        wethToPeth,
        liquidationRatio
      });
    } catch (e) {
      console.log(e, "Failed to initialize maker");
    }
  };

  render() {
    return (
      <Container>
        <header className="App-header">
          <h1 className="App-title">Settle Maker</h1>
        </header>
        {!!this.state.account ? this.renderContent() : this.renderLoading()}
      </Container>
    );
  }

  renderLoading() {
    return <Loader active>Metamask Locked?</Loader>;
  }

  renderContent() {
    return (
      <>
        <div>Logged in as {this.state.account}</div>
        <div>{this.state.ethPrice.toString()}</div>
        <div>{this.state.mkrPrice.toString()}</div>
        <div>Liquidation Ratio: {this.state.liquidationRatio}</div>
        {this.state.account && (
          <CDPList
            key={this.state.account}
            address={this.state.account}
            wethToPeth={this.state.wethToPeth}
            ethPrice={this.state.ethPrice}
            liquidationRation={this.state.liquidationRatio}
          />
        )}
      </>
    );
  }
}

export default App;
