import React, { Component } from 'react';
import InputCustomizado from './InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from '../TratadorErros'
import $ from 'jquery';

class FormularioAutor extends Component {
  constructor() {
    super();
    this.state = {
      nome: '',
      email: '',
      senha: ''
    };
    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);
    this.enviaForm = this.enviaForm.bind(this);
  }

  setNome(event) {
    this.setState({nome: event.target.value});
  }

  setEmail(event) {
    this.setState({email: event.target.value});
  }

  setSenha(event) {
    this.setState({senha: event.target.value});
  }

  enviaForm(evento) {
    evento.preventDefault();    
    $.ajax({
      url:'http://localhost:8080/api/autores',
      contentType:'application/json',
      dataType:'json',
      type:'post',
      data: JSON.stringify({nome:this.state.nome,email:this.state.email,senha:this.state.senha}),
      success: function(novaListagem){
        PubSub.publish('atualiza-lista-autores',novaListagem);        
        this.setState({nome:'',email:'',senha:''});
      }.bind(this),
      error: function(resposta){
        if(resposta.status === 400) {
          new TratadorErros().publicaErros(resposta.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish("limpa-erros",{});
      }      
    });
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
          <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
            <InputCustomizado id="nome" label="Nome" name="nome" type="text" value={this.state.nome} onChange={this.setNome} />
            <InputCustomizado id="email" label="Email" name="email" type="email" value={this.state.email} onChange={this.setEmail}/>
            <InputCustomizado id="senha" label="Senha" name="senha" type="password" value={this.state.senha} onChange={this.setSenha} />
            <div className="pure-control-group">                                  
              <label></label> 
              <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
            </div>
          </form>             
        </div>  
    );
  }
}

class TabelaAutores extends Component {
  render() {
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>email</th>
            </tr>
          </thead>
            <tbody>
              {
                this.props.lista.map(autor => {
                  return (
                    <tr key={autor.id}>
                      <td>{autor.nome}</td>
                      <td>{autor.email}</td>
                    </tr>
                  )
                })
              }
            </tbody>
        </table>       
      </div>
    );
  }
}

export default class AutoresBox extends Component {
  constructor() {
    super();
    this.state = {lista: []};
  }

  componentDidMount() {
    $.ajax({
      url:'http://localhost:8080/api/autores',
      dataType: 'json',
      success: function(resposta) {
        this.setState({lista:resposta})
      }.bind(this)
    });

    PubSub.subscribe('atualiza-lista-autores',function(topico,novaLista){
      this.setState({lista:novaLista});
    }.bind(this));
  }

  render() {
    return(
      <div>
        <FormularioAutor/>
        <TabelaAutores lista={this.state.lista}/>
      </div>
    )
  }
}