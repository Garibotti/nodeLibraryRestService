-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2018-03-20 14:48:09.09
CREATE DATABASE locadora;
USE locadora; 
-- tables
-- Table: clientes
CREATE TABLE clientes (
    id int NOT NULL AUTO_INCREMENT,
    nome varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    senha varchar(200) NOT NULL,
    UNIQUE INDEX email_unique (email),
    CONSTRAINT clientes_pk PRIMARY KEY (id)
);

-- Table: copias
CREATE TABLE copias (
    id int NOT NULL AUTO_INCREMENT,
    disponivel bool NOT NULL,
    filme_id int NOT NULL,
    CONSTRAINT copias_pk PRIMARY KEY (id)
);

-- Table: diretores
CREATE TABLE diretores (
    id int NOT NULL AUTO_INCREMENT,
    nome varchar(200) NOT NULL,
    CONSTRAINT diretores_pk PRIMARY KEY (id)
);

-- Table: filmes
CREATE TABLE filmes (
    id int NOT NULL AUTO_INCREMENT,
    titulo varchar(300) NOT NULL,
    diretor_id int NOT NULL,
    CONSTRAINT filmes_pk PRIMARY KEY (id)
);

-- Table: locacao
CREATE TABLE locacao (
    id int NOT NULL AUTO_INCREMENT,
    dt_locacao date NOT NULL,
    dt_devolucao date NULL,
    copia_id int NOT NULL,
    cliente_id int NOT NULL,
    CONSTRAINT locacao_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: copias_filmes (table: copias)
ALTER TABLE copias ADD CONSTRAINT copias_filmes FOREIGN KEY copias_filmes (filme_id)
    REFERENCES filmes (id);

-- Reference: filmes_diretores (table: filmes)
ALTER TABLE filmes ADD CONSTRAINT filmes_diretores FOREIGN KEY filmes_diretores (diretor_id)
    REFERENCES diretores (id);

-- Reference: locacao_clientes (table: locacao)
ALTER TABLE locacao ADD CONSTRAINT locacao_clientes FOREIGN KEY locacao_clientes (cliente_id)
    REFERENCES clientes (id);

-- Reference: locacao_copias (table: locacao)
ALTER TABLE locacao ADD CONSTRAINT locacao_copias FOREIGN KEY locacao_copias (copia_id)
    REFERENCES copias (id);

-- End of file.

