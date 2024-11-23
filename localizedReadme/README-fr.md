# GTFO Companion app

<p align="center"><img alt="Bannière" title="Bannière" src="https://raw.githubusercontent.com/cogilabs/GTFOBot/master/Images/GTFOBot-Banner-tr.png?raw=true"></p>

<p align="center">
    <a href="https://nodejs.org/" target="_blank"><img alt="Badge Node.js" title="Using Node.js!" src="https://img.shields.io/badge/node.js-233056?style=for-the-badge&logo=node.js&logoColor=white"/></a>
    <a href="https://discord.js.org/" target="_blank"><img alt="Badge Discord.js" title="Using Discord.js!" src="https://img.shields.io/badge/-Discord.js-5865F2?style=for-the-badge&logo=discord.js"/></a><br>
    <img alt="Status de Dauda" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fgtfobot.cogilabs.eu%2FGTFOBotStateCheck%2Fstate?style=for-the-badge"/>
    <img alt="Serveurs rejoins" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fgtfobot.cogilabs.eu%2FGTFOBotStateCheck%2Fservers?style=for-the-badge"/>
</p>

[→ In English](/README.md)  

## Table des matières

- [Introduction](#introduction)
- [Utiliser/lancer](#utiliserlancer)
- [Dites-moi ce que vous pensez !](#dites-moi-ce-que-vous-pensez)
- [L'application](#lapplication)
- [Exemples](#exemples)
- [Gestion des événements](#gestion-des-événements)
- [Réactions et réponses aux messages](#réactions-et-réponses-aux-messages)
- [Déverrouillage interactif des missions (nouveau)](#déverrouillage-interactif-des-missions-nouveau)
- [Plus d'informations](#plus-dinformations)
- [Configuration](#configuration)

## Introduction
Voici un bot Discord que j'ai créé pour aider mon équipe de GTFO dans la gestion des expéditions.

Il est capable d'afficher l'état des campagnes du jeu et d'afficher des détails sur les missions. Nous l'utilisons pour suivre notre progression à travers le complexe et pour nous familiariser avec les informations et les objectifs de la prochaine mission avant de nous y lancer.

## Utiliser/lancer

Si vous souhaitez utiliser ou essayer Dauda, vous pouvez l'ajouter à votre serveur en cliquant sur ce bouton :
<p align="center"><a href="https://discord.com/api/oauth2/authorize?client_id=1050757215885209640&permissions=283736656976&scope=bot" target="_blank"><img alt="Bouton d'ajout sur Discord" title="Ajoutez-moi sur votre serveur Discord !" src="https://img.shields.io/badge/Add%20Dauda%20on-Discord-5865F2?style=for-the-badge"></a></p>  

**NOUVEAU !** Dauda est maintenant présent sur le répertoire d'applications officiel de Discord ! **[Allez le voir ici](https://discord.com/application-directory/1050757215885209640)** !
  
## Dites-moi ce que vous pensez !

Si vous trouvez un bug, avez besoin d'aide, d'informations, souhaitez suivre les actualités concernant le bot, ou simplement discuter, n'hésitez pas à rejoindre le **[serveur Discord de Dauda](https://discord.gg/bwWBc8phma)** !

## L'application
L'application elle-même est juste un bot nommé Dauda (comme l'un des bots dans le jeu).

![Le bot](/Images/dauda.png?raw=true)

Elle propose plusieurs commandes, mais sa principale est `/rundowns` :

![Liste des commandes](/Images/commands-fr.png?raw=true)

`/rundowns` affiche la liste des campagnes disponibles :

![Liste des campagnes](/Images/rundownsList-fr.png?raw=true)

À partir de là, vous pourrez vérifier l'état de n'importe quelle campagne et obtenir des informations sur les missions, mais aussi marquer les missions et les sous-secteurs comme terminés ou non (optionnel).

## Exemples

#### Voici le résultat lorsque qu'un utilisateur clique sur le bouton `R7` :

![Affichage de la campagne](/Images/rundown-fr.png?raw=true)

Vous pouvez voir que les missions terminées avec succès sont représentées en vert.

#### Voici le résultat lorsque qu'un utilisateur clique sur le bouton `B3` :

![Affichage de la mission](/Images/mission-fr.png?raw=true)

Ici, les sous-secteurs auront une coche s'ils sont complétés.

En bas, vous pouvez cliquer sur un bouton pour marquer un secteur comme terminé (ou non terminé).

*Note : Pour utiliser ces boutons, l'utilisateur a besoin de l'autorisation de gérer les événements.*  
*Note #2 : Comme les coches, ces boutons n'apparaissent que lorsque le mode de progression[^1] est activé.*

## Gestion des événements

Le bot envoie un message lorsque qu'un événement planifié est créé sur le serveur. En vérifiant le nom et la description de l'événement à la recherche d'un ID de mission, il peut savoir où se déroule l'expédition et envoie un message incluant l'ID de la mission (si aucun ID de mission n'est trouvé, le message n'en parle tout simplement pas) :

> Le Gardien a prévu une nouvelle expédition vers ***R7B1***, alors soyez prêts à travailler ensemble, ou à mourir ensemble !

Il garde également une trace de qui est intéressé par l'expédition et envoie des messages en conséquence.

Lorsque l'événement commence, Dauda indiquera aux utilisateurs un lien pour les rejoindre.
  
Si vous modifiez l'ID de mission contenu dans l'événement, le bot enverra un message indiquant que l'expédition change de destination. Le message dépendra de l'achèvement de la première destination :

> C'est avec succès que l'expédition vers ***R1C2*** se dirige maintenant vers ***R1D1*** !

> L'expédition vers ***R7B2*** a échoué, mais peu importe, nous sommes maintenant envoyés vers ***R7C1*** !

Lorsqu'un événement est terminé, un message du même genre que ci-dessus sera envoyé, en vérifiant à nouveau l'achèvement de la mission dans le fichier d'achèvement.

Bien sûr, cela signifie que vous devez mettre à jour le fichier avec `/rundowns` avant de modifier ou de terminer l'événement.

Si la progression est désactivée[^1], la phrase apparaîtra toujours, mais sera plus neutre.
  
Par défaut, tous ces messages seront envoyés dans le premier salon nommé `general` qu'il trouve. S'il n'y en a pas, il les enverra dans le salon système. Si aucun salon système n'est défini, il ne les enverra pas.

Vous pouvez changer ce paramètre (par serveur) avec la commande `/config`[^1].

Le paramètre peut toujours être annulé en plaçant `` `ch:nomdusalon` `` quelque part dans la description de l'événement, le bot enverra alors n'importe quel message concernant cet événement dans ce salon sélectionné (ici, "#nomdusalon").

La commande `/config`[^1] permet également de configurer un rôle à mentionner lorsque des messages d'événement sont envoyés.

Par défaut, le bot ne réagit qu'aux événements ayant le texte `GTFO` dans leur description, ce comportement est modifiable avec la commande `/config`[^1].

## Réactions et réponses aux messages

Le bot est également capable de réagir à certains messages, comme une mention `@everyone`.

Par exemple, il peut réagir à des messages comme "Avons-nous terminé R1D1 ?", "Quel est l'état de R2B1 ?", "Savez-vous si nous en avons fini avec R7B3 ?" avec une coche verte ✅ ou une croix rouge ❌, en fonction de l'état de l'objectif principal de cette mission.

Il répond également à des messages comme "Merci Dauda" avec un message "De rien" aléatoire, et réagit avec un point d'interrogation ❓ lorsque quelqu'un dit des choses comme "Demande simplement à Dauda".

## Déverrouillage interactif des missions (nouveau)

Si vous en faites la demande avec la commande `/config`[^1], le bot peut bloquer l'accès aux missions qui sont verrouillées dans le jeu. Cependant, si vous souhaitez savoir quelles missions sont verrouillées tout en étant en mesure de les consulter, il est également possible de les modifier visuellement.

![Déverrouillage interactif en mode "bloquer"](/Images/unlockMechanism-fr.png?raw=true "Déverrouillage interactif en mode \"bloquer\"") ![Déverrouillage interactif en mode "visuel"](/Images/visuallyPlayable-fr.png?raw=true "Déverrouillage interactif en mode \"visuel\"")

## Plus d'informations

L'application est *entièrement localisée* en anglais et en français, en fonction de la langue du serveur pour la gestion des événements et des réponses/réactions aux messages, et de la langue de l'utilisateur interagissant pour les descriptions de commandes et les réponses aux commandes (intel, descriptions de missions, etc.). Il est également assez facile à localiser dans d'autres langues (voir [le fichier de localisation anglais](/localization/en-US.json)).

Vous pouvez vérifier si des fichiers de langue ont des traductions manquantes [ici](https://gtfobot.cogilabs.eu/GTFOBotStateCheck/missingLoc).  
Veuillez noter que certaines phrases ont été traduites à la main, soit car non-traduites en jeu, soit car pas encore vérifiées. Si vous souhaitez corriger une traduction, n'hésitez pas à [me contacter](#dites-moi-ce-que-vous-pensez).

Si un salon de texte nommé `dauda-logs` existe, le bot enregistrera toutes les actions qu'il effectue sur ce serveur, ainsi que des actions telles que le redémarrage ou la mise à jour. Vous pouvez bien sûr le changer pour n'importe quel autre salon (comme votre salon "bot-logs", par exemple) en utilisant la commande `/config`[^1].

Le bot dispose d'une commande `echo`, permettant aux administrateurs de parler en son nom (l'auteur réel du message peut toujours être vérifié dans le salon de logs).

## Configuration

La commande `/config` permet de personnaliser certaines des fonctions du bot :
<!--Tableau directement en HTML car je n'ai pas pu le convertir de Markdown en HTML pour mon site web-->
<table>
    <thead>
        <tr>
            <th>Option</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>salonEvenement</td>
            <td>Le salon où les messages liés aux événements sont envoyés</td>
        </tr>
        <tr>
            <td>rolePrisonniers</td>
            <td>Le rôle que les joueurs GTFO ont sur le serveur (par défaut, tout rôle nommé "Prisoners")</td>
        </tr>
        <tr>
            <td>salonLogs</td>
            <td>Le salon où les journaux sont envoyés (par défaut, tout salon nommé "dauda-logs")</td>
        </tr>
        <tr>
            <td>exigenceEvenement</td>
            <td>Indique si les événements doivent avoir "GTFO" dans leur description pour être pris en compte par le bot ou non (activé par défaut)</td>
        </tr>
        <tr>
            <td>progression</td>
            <td>Permet d'activer ou de désactiver la fonction de progression (activée par défaut)</td>
        </tr>
        <tr>
            <td>deverrouillageInteractif</td>
            <td>Bloque l'accès ou modifie le style des niveaux non déverrouillés (désactivé par défaut)<br> Peut être configuré pour <code>bloquer</code>, <code>visuel</code> ou <code>désactivé</code></td>
        </tr>
        <tr>
            <td>resetProgression</td>
            <td>Réinitialise la progression du serveur (irréversible, vous devrez taper "confirm" pour que la commande s'exécute)</td>
        </tr>
    </tbody>
</table>  

Gardez à l'esprit que le nom des options changera en fonction de la langue de votre client Discord.

<!--notes de bas de page-->
[^1]: Voir la section de configuration