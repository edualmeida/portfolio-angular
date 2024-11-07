import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../components/article-list.component";
import { tap } from "rxjs/operators";
import { UserService } from "../../../../core/services/user.service";
import { RxLet } from "@rx-angular/template/let";
import { IfAuthenticatedDirective } from "../../../../shared/directives/if-authenticated.directive";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-home-page",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
  imports: [
    NgClass,
    ArticleListComponent,
    AsyncPipe,
    RxLet,
    NgForOf,
    IfAuthenticatedDirective,
  ],
  standalone: true,
})
export default class ContactComponent implements OnInit {
  ImagePath: string;
  isAuthenticated = false;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
  ) {
    this.ImagePath = '/assets/img/hero/hero-1.jpg'
  }

  ngOnInit(): void {
    
  }
}
