CREATE TABLE [dbo].[CommentOwners] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [CommentId]    INT            NULL,
    [FirstName]    NVARCHAR (128) NULL,
    [LastName]     NVARCHAR (128) NULL,
    [FullName]     AS             (CASE WHEN [FirstName] IS NULL
                                             AND [LastName] IS NULL THEN NULL ELSE Trim((isnull([FirstName], '') + ' ') + isnull([LastName], '')) END),
    [Email]        NVARCHAR (128) NULL,
    [PhoneNumber]  NVARCHAR (128) NULL,
    [DateModified] DATETIME2 (7)  NOT NULL,
    [DateCreated]  DATETIME2 (7)  NOT NULL
);

GO
CREATE TABLE [dbo].[Comments] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Content]      NVARCHAR (MAX) NULL,
    [PostId]       INT            NULL,
    [UserId]       INT            NULL,
    [ParentId]     INT            NULL,
    [Edited]       BIT            NOT NULL,
    [LastEditedAt] DATETIME2 (7)  NULL,
    [StatusId]     INT            NOT NULL,
    [Anonymous]    BIT            NOT NULL,
    [DateModified] DATETIME2 (7)  NOT NULL,
    [DateCreated]  DATETIME2 (7)  NOT NULL
);

GO
CREATE TABLE [dbo].[Posts] (
    [Id]           INT             IDENTITY (1, 1) NOT NULL,
    [Title]        NVARCHAR (1024) NULL,
    [Content]      NVARCHAR (MAX)  NULL,
    [UserId]       INT             NULL,
    [ImageUrl]     NVARCHAR (1024) NULL,
    [Hidden]       BIT             NOT NULL,
    [DateModified] DATETIME2 (7)   NOT NULL,
    [DateCreated]  DATETIME2 (7)   NOT NULL
);

GO
CREATE TABLE [dbo].[Users] (
    [Id]           INT             IDENTITY (1, 1) NOT NULL,
    [FirstName]    NVARCHAR (128)  NULL,
    [LastName]     NVARCHAR (128)  NULL,
    [FullName]     AS              (CASE WHEN [FirstName] IS NULL
                                              AND [LastName] IS NULL THEN NULL ELSE Trim((isnull([FirstName], '') + ' ') + isnull([LastName], '')) END),
    [Email]        NVARCHAR (128)  NULL,
    [Username]     NVARCHAR (128)  NULL,
    [Password]     NVARCHAR (1024) NULL,
    [Token]        NVARCHAR (1024) NULL,
    [DpUrl]        NVARCHAR (1024) NULL,
    [DateModified] DATETIME2 (7)   NOT NULL,
    [DateCreated]  DATETIME2 (7)   NOT NULL
);

GO
ALTER TABLE [dbo].[CommentOwners]
    ADD CONSTRAINT [FK_CommentOwners_CommentId] FOREIGN KEY ([CommentId]) REFERENCES [dbo].[Comments] ([Id]);

GO
ALTER TABLE [dbo].[Comments]
    ADD CONSTRAINT [FK_Comments_PostId] FOREIGN KEY ([PostId]) REFERENCES [dbo].[Posts] ([Id]);

GO
ALTER TABLE [dbo].[Comments]
    ADD CONSTRAINT [FK_Comments_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);

GO
ALTER TABLE [dbo].[Posts]
    ADD CONSTRAINT [FK_Posts_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);

GO
ALTER TABLE [dbo].[CommentOwners]
    ADD CONSTRAINT [DF_CommentOwners_DateCreated] DEFAULT (getutcdate()) FOR [DateCreated];

GO
ALTER TABLE [dbo].[CommentOwners]
    ADD CONSTRAINT [DF_CommentOwners_DateModified] DEFAULT (getutcdate()) FOR [DateModified];

GO
ALTER TABLE [dbo].[Comments]
    ADD CONSTRAINT [DF_Comments_DateCreated] DEFAULT (getutcdate()) FOR [DateCreated];

GO
ALTER TABLE [dbo].[Comments]
    ADD CONSTRAINT [DF_Comments_DateModified] DEFAULT (getutcdate()) FOR [DateModified];

GO
ALTER TABLE [dbo].[Posts]
    ADD CONSTRAINT [DF_Posts_DateCreated] DEFAULT (getutcdate()) FOR [DateCreated];

GO
ALTER TABLE [dbo].[Posts]
    ADD CONSTRAINT [DF_Posts_DateModified] DEFAULT (getutcdate()) FOR [DateModified];

GO
ALTER TABLE [dbo].[Users]
    ADD CONSTRAINT [DF_Users_DateCreated] DEFAULT (getutcdate()) FOR [DateCreated];

GO
ALTER TABLE [dbo].[Users]
    ADD CONSTRAINT [DF_Users_DateModified] DEFAULT (getutcdate()) FOR [DateModified];

GO
ALTER TABLE [dbo].[CommentOwners]
    ADD CONSTRAINT [PK_CommentOwners] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Comments]
    ADD CONSTRAINT [PK_Comments] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Posts]
    ADD CONSTRAINT [PK_Posts] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[Users]
    ADD CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC);

GO
ALTER TABLE [dbo].[CommentOwners]
    ADD CONSTRAINT [UC_CommentOwners_CommentId] UNIQUE NONCLUSTERED ([CommentId] ASC);

GO
GRANT VIEW ANY COLUMN ENCRYPTION KEY DEFINITION TO PUBLIC;

GO
GRANT VIEW ANY COLUMN MASTER KEY DEFINITION TO PUBLIC;

GO
