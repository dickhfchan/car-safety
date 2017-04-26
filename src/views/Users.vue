<template>
  <div class="card-layout">
    <div class="column">
      <md-card class="md-primary" md-theme="blue" md-with-hover>
        <md-card-media>
          <img src="../../src/assets/img/card-image-1.jpg" alt="People">
        </md-card-media>

        <md-ink-ripple></md-ink-ripple>

        <md-card-actions>
          <md-button class="md-icon-button">
            <md-icon>favorite</md-icon>
          </md-button>

          <md-button class="md-icon-button">
            <md-icon>bookmark</md-icon>
          </md-button>

          <md-button class="md-icon-button">
            <md-icon>share</md-icon>
          </md-button>
        </md-card-actions>
      </md-card>

      <md-card class="md-primary" md-theme="green" md-with-hover>
        <md-card-header>
          <div class="md-title">Title goes here</div>
          <div class="md-subhead">Subtitle here</div>
        </md-card-header>

        <md-card-content>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</md-card-content>

        <md-ink-ripple></md-ink-ripple>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
    </div>

    <div class="column">
      <md-card class="md-primary" md-theme="orange" md-with-hover>
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Title here</div>
            <div class="md-subhead">Subtitle here</div>
          </md-card-header-text>

          <md-card-media>
            <img src="../../src/assets/img/avatar-2.jpg" alt="People">
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <md-card class="md-primary" md-theme="blue" md-with-hover>
        <md-card-media md-ratio="16:9">
          <img src="../../src/assets/img/card-sky.jpg" alt="People">
        </md-card-media>

        <md-ink-ripple></md-ink-ripple>

        <md-card-actions>
          <md-button class="md-icon-button">
            <md-icon>favorite</md-icon>
          </md-button>

          <md-button class="md-icon-button">
            <md-icon>bookmark</md-icon>
          </md-button>

          <md-button class="md-icon-button">
            <md-icon>share</md-icon>
          </md-button>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>



<style type="text/css">
  .card-layout {
    margin: 16px 15%;
    display: flex;

    .column {
      flex: 1;

      + .column {
        margin-left: 8px;
      }
    }

    .md-card + .md-card {
      margin-top: 8px;
    }
  }

</style>
