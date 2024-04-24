import random

def escolher_palavra():
    palavras = ["python", "programacao", "linguagem", "computador", "algoritmo", "desenvolvimento"]
    return random.choice(palavras)

def jogar_forca():
    palavra = escolher_palavra()
    letras_certas = []
    letras_erradas = []
    tentativas = 6

    print("Bem-vindo ao Jogo da Forca!")
    print("A palavra tem", len(palavra), "letras.")

    while True:
        palavra_oculta = ""
        for letra in palavra:
            if letra in letras_certas:
                palavra_oculta += letra
            else:
                palavra_oculta += "_"
        print("Palavra: ", palavra_oculta)

        if palavra_oculta == palavra:
            print("Parabéns! Você ganhou!")
            break

        print("Letras erradas: ", letras_erradas)
        print("Você tem", tentativas, "tentativas restantes.")

        letra_jogador = input("Digite uma letra: ").lower()

        if letra_jogador in palavra:
            print("Letra correta!")
            letras_certas.append(letra_jogador)
        else:
            print("Letra errada!")
            letras_erradas.append(letra_jogador)
            tentativas -= 1
            if tentativas == 0:
                print("Você perdeu! A palavra era:", palavra)
                break

jogar_forca()

