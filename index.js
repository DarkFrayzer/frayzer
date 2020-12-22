import bridge from '@vkontakte/vk-bridge';
import React, {
	Component,
	Fragment
} from "react";
import ReactDOM from "react-dom";

import config from './config.json';

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
	document.body.innerText = `Критическая ошибка; Не могу продолжать!\n${errorMsg} (${url}:${lineNumber})`
	return false;
}

class Popup extends Component {
	render() {
		return (
			<div class="popup">
				{ this.props.type == "history" ? (
					<div class="group_name">
						Поделиться результатом в истории?
					</div>
				) : (
					<Fragment>
						<div class="group_avatar">
							<img src={config.group_image} />
						</div>
						<div class="group_name">
							Аниме
						</div>
						<div class="popup_description">
							Подписаться на сообщество?
						</div>
					</Fragment>
				) }
				<div class="popup_button yes" onClick={this.props.onYes}>
					Да
				</div>
				<div class="popup_button no" onClick={this.props.onNo}>
					Нет
				</div>
			</div>
		)
	}
}

class Result extends Component {
	render() {
		return (
			<div class="result_container" style={{["--accent"]: this.props.result.color}}>
				<div class="result">
					<img src={ this.props.result.img } />
					<div class="result_content">
						<div class="result_text">
							{ this.props.result.text }
							<div class="small_text">
								По итогу
							</div>
						</div>
					</div>
				</div>
				<div class="result_info">
					{ this.props.result.description }
				</div>
				<div class="hcenter">
					<div class="next_button white" onClick={this.props.onStory}>
						Поделиться в истории
					</div>
					<div class="next_button white" onClick={this.props.onReset}>
						Повторить
					</div>
				</div>
			</div>
		)
	}
}

class PreResult extends Component {
	render() {
		return (
			<div class="pre_result">
				<div class="pre_result_header">
					Тест пройден!
				</div>
				<div class="hcenter">
					<div class="next_button white" onClick={this.props.onNext}>
						Узнать результат
					</div>
				</div>
			</div>
		)
	}
}

class Interview extends Component {
	render() {
		return (
			<div class="interview">
				<div class="interview_header">
					{ this.props.interview.header }
				</div>
				<div class="interview_text">
					{ this.props.interview.text }
				</div>
				<div class="hcenter">
					<div class="next_button white" onClick={this.props.onNext}>
						Пройти тест
					</div>
				</div>
			</div>
		)
	}
}

class OptionSelect extends Component {
	render() {
		return (
			<div class="option_select">
				{ this.props.variants.map((variant, i) => {
					return (
						<div class={`select_variant ${this.props.selected == i ? "selected" : ""}`} onClick={() => {
							this.props.onSelect(i)		
						}}>
							{ variant }
						</div>
					)
				}) }
			</div>
		)
	}
}

class NumberSelect extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<input required type="number" class="number_select" min="1" onChange={({target}) => {
				this.props.onSelect(target.validity.valid)
			}}/>
		)
	}
}

class Question extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		let question = this.props.question
		let answers;
		switch (question.answer.type) {
			case "option":
				answers = <OptionSelect selected={this.props.selected} variants={question.answer.variants} onSelect={this.props.onSelect}/>
				break;
			case "number":
				answers = <NumberSelect onSelect={this.props.onSelect}/>
				break;
			default:
				console.error("Unknown answer type:", question.answer.type)
		}
		return (
			<div class="question_container" style={{["--accent"]: question.color}}>
				<div class="question">
					<img src={ question.img } />
					<div class="question_content">
						<div class="question_text">
							{ question.text }
						</div>
					</div>
				</div>
				<div class="answers">
					{ answers }
				</div>
				<div class="hcenter">
					<div class={`next_button ${this.props.selected === null ? "disabled" : ""}`} onClick={this.props.onNext}>
						Далее
					</div>
				</div>
			</div>
		)
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pageType: "interview_start",
			question: null,
			questionIndex: -1,
			popup: false,
			pushedToHistory: false,
			questionIndex: null
		}
		this.genderSelected = null;

	}
	render() {
		switch (this.state.pageType) {
			case "interview_start":
				return <Interview interview={config.interview} onNext={() => {
					this.setState({
						pageType: "questions",
						questionIndex: 0,
						question: config.questions[0],
						questionSelected: null
					})
				}}/>
			case "questions":
				return <Question selected={this.state.questionSelected} question={this.state.question} onNext={() => {
					if (this.state.questionIndex >= config.questions.length - 1) {
						this.setState({
							pageType: "pre_result",
							questionSelected: null
						})
					} else {
						this.setState({
							questionIndex: this.state.questionIndex + 1,
							question: config.questions[this.state.questionIndex + 1],
							questionSelected: null
						})
					}
				}} onSelect={((i) => {
					if (this.state.questionIndex === 0) {
						this.genderSelected = i + 1
					}
					this.setState({
						questionSelected: i
					})
				})}/>
			case "pre_result":
				let goResult = () => {
					if (this.genderSelected === null) {
						alert("NOT SET!");
					}
					let chars = config.results.filter((ch) => ch.gender == this.genderSelected)
					const i = Math.floor(Math.random() * chars.length)
					this.resultCharecter = chars[i]
				}
				return <Fragment>
						<PreResult onNext={() => {
							this.setState({
								popup: true
							})
						}}/>
						{ this.state.popup && <Popup onNo={() => {
							goResult()
							this.setState({
								popup: false,
								pageType: "result"
							})
						}} onYes={() => {
							bridge.send("VKWebAppJoinGroup", {"group_id": config.group_id}).then((data) => {
								goResult()
								this.setState({
									popup: false,
									pageType: "result"
								})
							}, (data) => {
								goResult()
								this.setState({
									popup: false,
									pageType: "result"
								})
							})
						}}/> }
					</Fragment>
				Далее
			case "result":
				let pushToHistory = () => {
					bridge.send("VKWebAppShowStoryBox", {
						"background_type": "image",
						"url": window.location.origin + "/" + window.location.pathname + "/" + this.resultCharecter.history_url,
						"locked": true,
						"attachment": {
							"text": "go_to",
							"type": "url",
							"url": "https://vk.com/app" + config.appID
						}
					})
				}
				return <Fragment>
					<Result result={this.resultCharecter} onReset={() => {
						if (this.state.pushedToHistory) {
							this.setState({
								pushedToHistory: false,
								pageType: "interview_start"
							})
						} else {
							this.setState({
								popup: true
							})
						}
					}} onStory={() => {
						pushToHistory()
						this.setState({
							pushedToHistory: true
						})
					}}/>
					{ this.state.popup && <Popup type="history" onNo={() => {
						this.setState({
							popup: false,
							pushedToHistory: false,
							pageType: "interview_start"
						})
					}} onYes={() => {
						pushToHistory()
						this.setState({
							popup: false,
							pushedToHistory: false,
							pageType: "interview_start"
						})
					}}/> }
				</Fragment>

		}
	}
}

bridge.send("VKWebAppInit", {});
ReactDOM.render(<App />, document.getElementById("root"));
